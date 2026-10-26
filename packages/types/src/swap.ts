// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { HexString } from 'dedot/utils'

// Tokens supported by swapping on Polkadot Asset Hub.
export type SwapToken = 'DOT' | 'dotUSD' | 'USDT' | 'USDC'

// Non-DOT tokens paired with DOT in a liquidity pool.
export type SwapPoolToken = Exclude<SwapToken, 'DOT'>

// Whether the requested amount fixes the input to spend or the output to receive.
export type SwapMode = 'exactIn' | 'exactOut'

// Reserves and trading fee for a DOT/token automated market maker (AMM) pool.
export type SwapPool = {
	asset: SwapPoolToken
	reserveDot: bigint
	reserveAsset: bigint
	fee: number
}

// Reserves, fees, and mint/redeem limits for the dotUSD peg stability module (PSM).
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

// Token pair, amount, and swap mode used to request quotes.
export type SwapRequest = {
	assetIn: SwapToken
	assetOut: SwapToken
	amount: bigint
	mode: SwapMode
}

// An AMM or PSM route with quoted amounts, fees, price impact, and the source block.
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

// Service methods for fetching swap quotes and building swap transactions.
export type SwapInterface = {
	quotes: (request: SwapRequest) => Promise<SwapQuote[]>
	swap: (
		quote: SwapQuote,
		address: string,
		recipient: string,
		slippageBps: number,
	) => SubmittableExtrinsic
}
