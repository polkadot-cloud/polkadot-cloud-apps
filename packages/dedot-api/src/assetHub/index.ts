// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import {
	AssetHubPoolTokens,
	assetHubAssetId,
	assetHubLocation,
} from 'consts/assetHub'
import {
	ChainHeadBlockNotPinnedError,
	ChainHeadBlockPrunedError,
	type DedotClient,
	type SubmittableExtrinsic,
} from 'dedot'
import type { GenericStorageQuery } from 'dedot/types'
import { blake2AsHex, concatU8a, hexToU8a, stringToU8a } from 'dedot/utils'
import type {
	AssetHubExchange,
	AssetHubPool,
	AssetHubPsm,
	AssetHubSwapQuote,
	AssetHubToken,
} from 'types'
import { asTx } from '../util'
import { assertAmount, PERMILL, psmAmounts, slippageLimit } from './math'

type Location = ReturnType<typeof assetHubLocation>
type Pair = [Location, Location]
type PsmInfo = {
	maxDebt: bigint
	minSwapAmount: bigint
	internalDecimals: number
}
type External = { status: AssetHubPsm['status']; decimals: number }

// PSM is newer than the shared generated chain package. Bind its small interface to
// the connected runtime's metadata; calls are encoded by Dedot, never by hand.
type PsmQueries = {
	psm: GenericStorageQuery<
		(internal: Location) => PsmInfo | undefined,
		Location
	>
	externalAssets: GenericStorageQuery<
		(pair: Pair) => External | undefined,
		Pair
	>
	psmDebt: GenericStorageQuery<(pair: Pair) => bigint, Pair>
	mintingFee: GenericStorageQuery<(pair: Pair) => number, Pair>
	redemptionFee: GenericStorageQuery<(pair: Pair) => number, Pair>
	assetCeilingWeight: GenericStorageQuery<(pair: Pair) => number, Pair>
}
type PsmTransactions = Record<
	'mint' | 'redeem',
	(
		internal: Location,
		external: Location,
		amount: bigint,
		maxFee: number,
	) => SubmittableExtrinsic
>

const locationKey = (location: Location) =>
	JSON.stringify(location, (_, value) =>
		typeof value === 'bigint' ? value.toString() : value,
	)
const clampMinimum = (amount: bigint, bps: number) => {
	const min = slippageLimit(amount, bps)
	return min > 0n ? min : 1n
}
const isUnavailableBlock = (error: unknown) =>
	error instanceof ChainHeadBlockNotPinnedError ||
	error instanceof ChainHeadBlockPrunedError ||
	(error instanceof Error && error.message.startsWith('Block is not pinned'))

export const createAssetHubExchange = (
	api: DedotClient<PolkadotAssetHubApi>,
): AssetHubExchange => {
	const readQuotes: AssetHubExchange['quotes'] = async (request) => {
		assertAmount(request.amount)
		if (request.assetIn === request.assetOut) return []
		const fetchedAt = Date.now()
		const { hash } = await api.block.finalized()
		const at = await api.at(hash)
		const pools = await Promise.all(
			AssetHubPoolTokens.filter(
				(asset) => asset === request.assetIn || asset === request.assetOut,
			).map(async (asset): Promise<AssetHubPool | undefined> => {
				const reserves = await at.call.assetConversionApi.getReserves(
					assetHubLocation('DOT'),
					assetHubLocation(asset),
				)
				if (!reserves || reserves.some((reserve) => reserve <= 0n))
					return undefined
				return {
					asset,
					reserveDot: reserves[0],
					reserveAsset: reserves[1],
					fee: at.consts.assetConversion.lpFee,
				}
			}),
		)
		let psm: AssetHubPsm | null = null
		const pallet = at.registry.metadata.pallets.find(
			({ name }) => name === 'Psm',
		)
		if (
			pallet &&
			[request.assetIn, request.assetOut].every(
				(asset) => asset === 'USDT' || asset === 'dotUSD',
			)
		) {
			const query = at.query.psm as unknown as PsmQueries
			const internal = assetHubLocation('dotUSD')
			const pair: Pair = [internal, assetHubLocation('USDT')]
			const [info, rows] = await Promise.all([
				query.psm(internal),
				query.externalAssets.entries(internal),
			])
			const usdtIndex = rows.findIndex(
				([ids]) => locationKey(ids[1]) === locationKey(pair[1]),
			)
			const external = rows[usdtIndex]?.[1]
			if (
				info &&
				external &&
				info.internalDecimals === 6 &&
				external.decimals === 6
			) {
				const key = query.psm.meta.storageType
				if (key?.type !== 'Map')
					throw new Error('Unsupported PSM storage layout')
				const encoded = at.registry
					.findCodec(key.value.keyTypeId)
					.tryEncode(internal)
				const reserveAccount = blake2AsHex(
					concatU8a(
						stringToU8a('modl'),
						hexToU8a(at.consts.psm.palletId),
						encoded,
					),
				)
				const pairs = rows.map(([ids]) => ids)
				const [debts, weights, mintFee, redeemFee, reserve] = await Promise.all(
					[
						query.psmDebt.multi(pairs),
						query.assetCeilingWeight.multi(pairs),
						query.mintingFee(pair),
						query.redemptionFee(pair),
						at.query.assets.account([assetHubAssetId('USDT'), reserveAccount]),
					],
				)
				const debt = debts[usdtIndex] ?? 0n
				const weight = weights[usdtIndex] ?? 0
				const totalDebt = debts.reduce((sum, value) => sum + value, 0n)
				const totalWeight = weights.reduce((sum, value) => sum + value, 0)
				// Match Perbill::from_rational(...).mul_floor(maxDebt).
				const weightedCap =
					totalWeight > 0
						? (info.maxDebt *
								((BigInt(weight) * 1_000_000_000n) / BigInt(totalWeight))) /
							1_000_000_000n
						: 0n
				const aggregateCap =
					info.maxDebt > totalDebt - debt
						? info.maxDebt - (totalDebt - debt)
						: 0n
				psm = {
					status: external.status,
					maxDebt: weightedCap < aggregateCap ? weightedCap : aggregateCap,
					debt,
					minSwapAmount: info.minSwapAmount,
					reserve: reserve?.status === 'Frozen' ? 0n : (reserve?.balance ?? 0n),
					mintFee,
					redeemFee,
					weight,
				}
			}
		}
		const result: AssetHubSwapQuote[] = []
		const psmQuote = psm && psmAmounts(request, psm)
		if (psmQuote)
			result.push({
				...request,
				...psmQuote,
				kind: 'psm',
				path: [request.assetIn, request.assetOut],
				priceImpactBps: 0,
				hash,
				fetchedAt,
			})
		const path: AssetHubToken[] =
			request.assetIn === 'DOT' || request.assetOut === 'DOT'
				? [request.assetIn, request.assetOut]
				: [request.assetIn, 'DOT', request.assetOut]
		const routePools = path
			.slice(0, -1)
			.map((from, index) =>
				pools.find(
					(pool) => pool?.asset === (from === 'DOT' ? path[index + 1] : from),
				),
			)
		if (routePools.some((pool) => !pool)) return result
		const { assetConversionApi } = at.call
		const price =
			request.mode === 'exactIn'
				? assetConversionApi.quotePriceExactTokensForTokens
				: assetConversionApi.quotePriceTokensForExactTokens
		let amount = request.amount
		const indexes = path.slice(0, -1).map((_, index) => index)
		if (request.mode === 'exactOut') indexes.reverse()
		for (const index of indexes) {
			const value = await price(
				assetHubLocation(path[index]),
				assetHubLocation(path[index + 1]),
				amount,
				true,
			)
			if (!value || value <= 0n) return result
			amount = value
		}
		const amountIn = request.mode === 'exactIn' ? request.amount : amount
		const amountOut = request.mode === 'exactIn' ? amount : request.amount
		let spotOutput = amountIn
		let retainedFee = PERMILL
		for (const [index, pool] of routePools.entries()) {
			if (!pool) continue
			const fromDot = path[index] === 'DOT'
			spotOutput =
				(spotOutput *
					(PERMILL - BigInt(pool.fee)) *
					(fromDot ? pool.reserveAsset : pool.reserveDot)) /
				(PERMILL * (fromDot ? pool.reserveDot : pool.reserveAsset))
			retainedFee = (retainedFee * (PERMILL - BigInt(pool.fee))) / PERMILL
		}
		const priceImpactBps =
			spotOutput > amountOut
				? Number(((spotOutput - amountOut) * 10_000n) / spotOutput)
				: 0
		result.push({
			...request,
			kind: 'amm',
			path,
			amountIn,
			amountOut,
			fee: Number(PERMILL - retainedFee),
			priceImpactBps,
			hash,
			fetchedAt,
		})
		return result.sort((a, b) => {
			const aValue = request.mode === 'exactIn' ? a.amountOut : b.amountIn
			const bValue = request.mode === 'exactIn' ? b.amountOut : a.amountIn
			return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
		})
	}

	const quotes: AssetHubExchange['quotes'] = async (request) => {
		try {
			return await readQuotes(request)
		} catch (error) {
			if (!isUnavailableBlock(error)) throw error
			// Rebuild every route from one fresh snapshot, including PSM fees and
			// capacity. Never reuse a partial quote from the unavailable block.
			return readQuotes(request)
		}
	}

	const swap: AssetHubExchange['swap'] = (
		quote,
		address,
		recipient,
		slippageBps,
	) => {
		if (Date.now() - quote.fetchedAt > 30_000)
			throw new Error('Quote expired. Refresh to continue.')
		assertAmount(quote.amountIn)
		assertAmount(quote.amountOut)
		if (quote.kind === 'psm') {
			const psmTx = api.tx.psm as unknown as PsmTransactions
			const mint = quote.assetIn === 'USDT'
			const call = (mint ? psmTx.mint : psmTx.redeem)(
				assetHubLocation('dotUSD'),
				assetHubLocation('USDT'),
				quote.amountIn,
				quote.fee,
			)
			if (address === recipient) return call
			const transfer = api.tx.assets.transfer(
				assetHubAssetId(mint ? 'dotUSD' : 'USDT'),
				recipient,
				quote.amountOut,
			)
			// A PSM always credits the signer. The subsequent transfer is all-or-nothing.
			const batchAll = api.tx.utility.batchAll as unknown as (
				calls: SubmittableExtrinsic['call'][],
			) => SubmittableExtrinsic
			return batchAll([call.call, asTx(transfer).call])
		}
		const path = quote.path.map(assetHubLocation)
		return quote.mode === 'exactIn'
			? asTx(
					api.tx.assetConversion.swapExactTokensForTokens(
						path,
						quote.amountIn,
						clampMinimum(quote.amountOut, slippageBps),
						recipient,
						true,
					),
				)
			: asTx(
					api.tx.assetConversion.swapTokensForExactTokens(
						path,
						quote.amountOut,
						slippageLimit(quote.amountIn, slippageBps, true),
						recipient,
						true,
					),
				)
	}

	return {
		quotes,
		swap,
	}
}
