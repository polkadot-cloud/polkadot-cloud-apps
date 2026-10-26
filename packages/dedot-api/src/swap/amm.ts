// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BASIS_POINTS, PERMILL } from 'consts/math'
import { SwapPoolTokens, swapLocation } from 'consts/swap'
import type { SwapPool, SwapQuote, SwapRequest, SwapToken } from 'types'
import type { SwapSnapshot } from './types'

// Supported AMM routes use DOT directly or as the single intermediary.
const ammPath = ({ assetIn, assetOut }: SwapRequest): SwapToken[] =>
	assetIn === 'DOT' || assetOut === 'DOT'
		? [assetIn, assetOut]
		: [assetIn, 'DOT', assetOut]

// Quotes every leg against one block, walking backwards when the output is fixed.
export const quoteAmm = async (
	{ at, hash, fetchedAt }: SwapSnapshot,
	request: SwapRequest,
): Promise<SwapQuote | undefined> => {
	const path = ammPath(request)
	const pools = await Promise.all(
		SwapPoolTokens.filter((asset) => path.includes(asset)).map(
			async (asset): Promise<SwapPool | undefined> => {
				const reserves = await at.call.assetConversionApi.getReserves(
					swapLocation('DOT'),
					swapLocation(asset),
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
	const legs = path
		.slice(0, -1)
		.map((from, index) => ({ from, to: path[index + 1] }))
	const routePools = legs.map(({ from, to }) =>
		pools.find((pool) => pool?.asset === (from === 'DOT' ? to : from)),
	)
	if (!routePools.every((pool) => pool !== undefined)) return undefined

	const { assetConversionApi } = at.call
	const quotePrice =
		request.mode === 'exactIn'
			? assetConversionApi.quotePriceExactTokensForTokens
			: assetConversionApi.quotePriceTokensForExactTokens
	const quoteLegs = request.mode === 'exactIn' ? legs : [...legs].reverse()
	let amount = request.amount
	for (const { from, to } of quoteLegs) {
		const value = await quotePrice(
			swapLocation(from),
			swapLocation(to),
			amount,
			true,
		)
		if (!value || value <= 0n) return undefined
		amount = value
	}
	const amountIn = request.mode === 'exactIn' ? request.amount : amount
	const amountOut = request.mode === 'exactIn' ? amount : request.amount

	// Compare against the fee-adjusted marginal price, rounding only after all legs.
	let spotNumerator = amountIn
	let spotDenominator = 1n
	let retainedFee = PERMILL
	for (const [index, pool] of routePools.entries()) {
		const fromDot = legs[index].from === 'DOT'
		const feeComplement = PERMILL - BigInt(pool.fee)
		spotNumerator *=
			feeComplement * (fromDot ? pool.reserveAsset : pool.reserveDot)
		spotDenominator *= PERMILL * (fromDot ? pool.reserveDot : pool.reserveAsset)
		retainedFee = (retainedFee * feeComplement) / PERMILL
	}
	const spotOutput = spotNumerator / spotDenominator
	const priceImpactBps =
		spotOutput > amountOut
			? Number(((spotOutput - amountOut) * BASIS_POINTS) / spotOutput)
			: 0
	return {
		...request,
		kind: 'amm',
		path,
		amountIn,
		amountOut,
		fee: Number(PERMILL - retainedFee),
		priceImpactBps,
		hash,
		fetchedAt,
	}
}
