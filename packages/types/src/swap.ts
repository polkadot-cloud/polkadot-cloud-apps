// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { HexString } from 'dedot/utils'

export type SwapToken = 'DOT' | 'dotUSD' | 'USDT' | 'USDC'
export type SwapPoolToken = Exclude<SwapToken, 'DOT'>
export type SwapMode = 'exactIn' | 'exactOut'

export type SwapPool = {
	asset: SwapPoolToken
	reserveDot: bigint
	reserveAsset: bigint
	fee: number
}

export type SwapPsm = {
	status: 'AllEnabled' | 'MintingDisabled' | 'AllDisabled'
	maxDebt: bigint
	debt: bigint
	minSwapAmount: bigint
	reserve: bigint
	mintFee: number
	redeemFee: number
	weight: number
}

export type SwapRequest = {
	assetIn: SwapToken
	assetOut: SwapToken
	amount: bigint
	mode: SwapMode
}

export type SwapQuote = SwapRequest & {
	kind: 'amm' | 'psm'
	path: SwapToken[]
	amountIn: bigint
	amountOut: bigint
	fee: number
	priceImpactBps: number
	hash: HexString
	fetchedAt: number
}

export type SwapInterface = {
	quotes: (request: SwapRequest) => Promise<SwapQuote[]>
	swap: (
		quote: SwapQuote,
		address: string,
		recipient: string,
		slippageBps: number,
	) => SubmittableExtrinsic
}
