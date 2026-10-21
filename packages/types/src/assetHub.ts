// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { HexString } from 'dedot/utils'

export type AssetHubToken = 'DOT' | 'dotUSD' | 'USDT' | 'USDC'
export type AssetHubPoolToken = Exclude<AssetHubToken, 'DOT'>
export type SwapMode = 'exactIn' | 'exactOut'

export type AssetHubPool = {
	asset: AssetHubPoolToken
	lpToken: number
	reserveDot: bigint
	reserveAsset: bigint
	lpSupply: bigint
	lpBalance: bigint
	lpFrozen: boolean
	lpMinBalance: bigint
	fee: number
	withdrawalFee: number
	minLiquidity: bigint
	fetchedAt: number
}

export type AssetHubPsm = {
	status: 'AllEnabled' | 'MintingDisabled' | 'AllDisabled'
	maxDebt: bigint
	debt: bigint
	minSwapAmount: bigint
	reserve: bigint
	mintFee: number
	redeemFee: number
	weight: number
}

export type AssetHubMarket = {
	hash: HexString
	block: number
	fetchedAt: number
	pools: AssetHubPool[]
	psm: AssetHubPsm | null
}

export type AssetHubSwapRequest = {
	assetIn: AssetHubToken
	assetOut: AssetHubToken
	amount: bigint
	mode: SwapMode
}

export type AssetHubSwapQuote = AssetHubSwapRequest & {
	kind: 'amm' | 'psm'
	path: AssetHubToken[]
	amountIn: bigint
	amountOut: bigint
	fee: number
	priceImpactBps: number
	hash: HexString
	fetchedAt: number
}

export type AssetHubExchange = {
	market: (address?: string) => Promise<AssetHubMarket>
	quotes: (
		market: AssetHubMarket,
		request: AssetHubSwapRequest,
	) => Promise<AssetHubSwapQuote[]>
	swap: (
		quote: AssetHubSwapQuote,
		address: string,
		recipient: string,
		slippageBps: number,
	) => SubmittableExtrinsic
	addLiquidity: (
		pool: AssetHubPool,
		dot: bigint,
		asset: bigint,
		address: string,
		slippageBps: number,
	) => SubmittableExtrinsic
	removeLiquidity: (
		pool: AssetHubPool,
		burn: bigint,
		address: string,
		slippageBps: number,
	) => SubmittableExtrinsic
}
