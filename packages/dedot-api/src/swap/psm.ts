// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { swapAssetId, swapDecimals, swapLocation } from 'consts/swap'
import { blake2AsHex, concatU8a, hexToU8a, stringToU8a } from 'dedot/utils'
import type { SwapPsm, SwapQuote, SwapRequest } from 'types'
import { psmAmounts, psmDebtLimit } from './math'
import type { Location, PsmPair, PsmQueries, SwapSnapshot } from './types'

const locationKey = (location: Location) =>
	JSON.stringify(location, (_, value) =>
		typeof value === 'bigint' ? value.toString() : value,
	)

// Reads the approved USDT pair, its reserve, and both debt ceilings at one block.
const readPsm = async (
	at: SwapSnapshot['at'],
): Promise<SwapPsm | undefined> => {
	if (!at.registry.metadata.pallets.some(({ name }) => name === 'Psm'))
		return undefined
	const query = at.query.psm as unknown as PsmQueries
	const internal = swapLocation('dotUSD')
	const pair: PsmPair = [internal, swapLocation('USDT')]
	const [info, rows] = await Promise.all([
		query.psm(internal),
		query.externalAssets.entries(internal),
	])
	const usdtIndex = rows.findIndex(
		([ids]) => locationKey(ids[1]) === locationKey(pair[1]),
	)
	const external = rows[usdtIndex]?.[1]
	// The fixed-rate math requires equal denominations matching our token configuration.
	if (
		!info ||
		!external ||
		info.internalDecimals !== swapDecimals('dotUSD') ||
		external.decimals !== swapDecimals('USDT') ||
		info.internalDecimals !== external.decimals
	)
		return undefined

	const key = query.psm.meta.storageType
	if (key?.type !== 'Map') throw new Error('Unsupported PSM storage layout')
	const encoded = at.registry.findCodec(key.value.keyTypeId).tryEncode(internal)
	// Runtime derivation: blake2_256((PalletId::TYPE_ID, PalletId, internal_asset).encode()).
	const reserveAccount = blake2AsHex(
		concatU8a(stringToU8a('modl'), hexToU8a(at.consts.psm.palletId), encoded),
	)
	const pairs = rows.map(([ids]) => ids)
	const [debts, weights, mintFee, redeemFee, reserve] = await Promise.all([
		query.psmDebt.multi(pairs),
		query.assetCeilingWeight.multi(pairs),
		query.mintingFee(pair),
		query.redemptionFee(pair),
		at.query.assets.account([swapAssetId('USDT'), reserveAccount]),
	])
	return {
		status: external.status,
		maxDebt: psmDebtLimit(info.maxDebt, debts, weights, usdtIndex),
		debt: debts[usdtIndex] ?? 0n,
		minSwapAmount: info.minSwapAmount,
		reserve: reserve?.status === 'Frozen' ? 0n : (reserve?.balance ?? 0n),
		mintFee,
		redeemFee,
		weight: weights[usdtIndex] ?? 0,
	}
}

// Quotes the supported direct USDT/dotUSD PSM route when its limits permit the swap.
export const quotePsm = async (
	{ at, hash, fetchedAt }: SwapSnapshot,
	request: SwapRequest,
): Promise<SwapQuote | undefined> => {
	if (
		![request.assetIn, request.assetOut].every(
			(asset) => asset === 'USDT' || asset === 'dotUSD',
		)
	)
		return undefined
	const psm = await readPsm(at)
	const amounts = psm && psmAmounts(request, psm)
	if (!amounts) return undefined
	return {
		...request,
		...amounts,
		kind: 'psm',
		path: [request.assetIn, request.assetOut],
		priceImpactBps: 0,
		hash,
		fetchedAt,
	}
}
