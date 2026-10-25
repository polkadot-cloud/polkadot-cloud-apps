// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import {
	AssetHubAssetIds,
	AssetHubPoolTokens,
	assetHubLocation,
} from 'consts/assetHub'
import {
	ChainHeadBlockNotPinnedError,
	ChainHeadBlockPrunedError,
	type DedotClient,
	type SubmittableExtrinsic,
} from 'dedot'
import { blake2AsHex, concatU8a, stringToU8a } from 'dedot/utils'
import type {
	AssetHubExchange,
	AssetHubPool,
	AssetHubPsm,
	AssetHubSwapQuote,
	AssetHubToken,
} from 'types'
import { asTx, getPallet } from '../util'
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
	psm: (internal: Location) => Promise<PsmInfo | undefined>
	externalAssets: {
		(pair: Pair): Promise<External | undefined>
		entries: () => Promise<[Pair, External][]>
	}
	psmDebt: (pair: Pair) => Promise<bigint>
	mintingFee: (pair: Pair) => Promise<number>
	redemptionFee: (pair: Pair) => Promise<number>
	assetCeilingWeight: (pair: Pair) => Promise<number>
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
	const readMarket: AssetHubExchange['market'] = async () => {
		const fetchedAt = Date.now()
		const { hash, number: block } = await api.block.finalized()
		const at = await api.at(hash)
		const pools = await Promise.all(
			AssetHubPoolTokens.map(
				async (asset): Promise<AssetHubPool | undefined> => {
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
				},
			),
		)
		let psm: AssetHubPsm | null = null
		const pallet = getPallet(api, 'Psm')
		if (pallet) {
			const query = at.query.psm as unknown as PsmQueries
			const internal = assetHubLocation('dotUSD')
			const pair: Pair = [internal, assetHubLocation('USDT')]
			const [info, external, externals] = await Promise.all([
				query.psm(internal),
				query.externalAssets(pair),
				query.externalAssets.entries(),
			])
			if (
				info &&
				external &&
				info.internalDecimals === 6 &&
				external.decimals === 6
			) {
				const key = pallet.storage?.entries.find(
					(item) => item.name === 'Psm',
				)?.storageType
				if (key?.type !== 'Map')
					throw new Error('Unsupported PSM storage layout')
				const encoded = api.registry
					.findCodec(key.value.keyTypeId)
					.tryEncode(internal)
				const reserveAccount = blake2AsHex(
					concatU8a(stringToU8a('modlpy/pegsm'), encoded),
				)
				const rows = externals.filter(
					([ids]) => locationKey(ids[0]) === locationKey(internal),
				)
				const [debts, weights, mintFee, redeemFee, reserve] = await Promise.all(
					[
						Promise.all(rows.map(([ids]) => query.psmDebt(ids))),
						Promise.all(rows.map(([ids]) => query.assetCeilingWeight(ids))),
						query.mintingFee(pair),
						query.redemptionFee(pair),
						at.query.assets.account([AssetHubAssetIds.USDT, reserveAccount]),
					],
				)
				const usdtIndex = rows.findIndex(
					([ids]) => locationKey(ids[1]) === locationKey(pair[1]),
				)
				const debt = debts[usdtIndex] ?? 0n
				const weight = weights[usdtIndex] ?? 0
				const totalDebt = debts.reduce((sum, value) => sum + value, 0n)
				const totalWeight = weights.reduce((sum, value) => sum + value, 0)
				const weightedCap =
					totalWeight > 0
						? (info.maxDebt * BigInt(weight)) / BigInt(totalWeight)
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
		return {
			hash,
			block,
			fetchedAt,
			pools: pools.filter((pool): pool is AssetHubPool => !!pool),
			psm,
		}
	}

	const market: AssetHubExchange['market'] = async () => {
		try {
			return await readMarket()
		} catch (error) {
			if (!isUnavailableBlock(error)) throw error
			return readMarket()
		}
	}

	const readQuotes: AssetHubExchange['quotes'] = async (snapshot, request) => {
		assertAmount(request.amount)
		if (request.assetIn === request.assetOut) return []
		const result: AssetHubSwapQuote[] = []
		const psm = snapshot.psm && psmAmounts(request, snapshot.psm)
		if (psm)
			result.push({
				...request,
				...psm,
				kind: 'psm',
				path: [request.assetIn, request.assetOut],
				priceImpactBps: 0,
				hash: snapshot.hash,
				fetchedAt: snapshot.fetchedAt,
			})
		const path: AssetHubToken[] =
			request.assetIn === 'DOT' || request.assetOut === 'DOT'
				? [request.assetIn, request.assetOut]
				: [request.assetIn, 'DOT', request.assetOut]
		const routePools = path
			.slice(0, -1)
			.map((from, index) =>
				snapshot.pools.find(
					(pool) => pool.asset === (from === 'DOT' ? path[index + 1] : from),
				),
			)
		if (routePools.some((pool) => !pool)) return result
		const at = await api.at(snapshot.hash)
		let amount = request.amount
		const indexes = path.slice(0, -1).map((_, index) => index)
		if (request.mode === 'exactOut') indexes.reverse()
		for (const index of indexes) {
			const value =
				request.mode === 'exactIn'
					? await at.call.assetConversionApi.quotePriceExactTokensForTokens(
							assetHubLocation(path[index]),
							assetHubLocation(path[index + 1]),
							amount,
							true,
						)
					: await at.call.assetConversionApi.quotePriceTokensForExactTokens(
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
			hash: snapshot.hash,
			fetchedAt: snapshot.fetchedAt,
		})
		return result.sort((a, b) => {
			const aValue = request.mode === 'exactIn' ? a.amountOut : b.amountIn
			const bValue = request.mode === 'exactIn' ? b.amountOut : a.amountIn
			return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
		})
	}

	const quotes: AssetHubExchange['quotes'] = async (snapshot, request) => {
		try {
			return await readQuotes(snapshot, request)
		} catch (error) {
			if (!isUnavailableBlock(error)) throw error
			// Rebuild every route from one fresh snapshot, including PSM fees and
			// capacity. Never reuse a partial quote from the unavailable block.
			return readQuotes(await market(), request)
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
				AssetHubAssetIds[mint ? 'dotUSD' : 'USDT'],
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
		market,
		quotes,
		swap,
	}
}
