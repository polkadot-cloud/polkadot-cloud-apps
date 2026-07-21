// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'

export type StablecoinChainId = 'statemint' | 'hydration'

export type StablecoinSymbol = 'USDC' | 'USDT' | 'HOLLAR'

export type StablecoinFeeAssetSymbol = 'DOT' | StablecoinSymbol

export type StablecoinAssetSymbol = StablecoinFeeAssetSymbol

export type StablecoinAssetConfig = {
	decimals: number
	existentialDeposit: bigint
	assetId?: number
	erc20Contract?: string
}

export type StablecoinChainConfig = {
	label: string
	assets: Partial<Record<StablecoinAssetSymbol, StablecoinAssetConfig>>
}

export type StablecoinBalance = {
	chain: StablecoinChainId
	symbol: StablecoinAssetSymbol
	free: bigint
	frozen: bigint
	existentialDeposit: bigint
	decimals: number
}

export type StablecoinTransferInput = {
	chain: StablecoinChainId
	symbol: StablecoinSymbol
	recipient: string
	amount: bigint
}

export type StablecoinFeePayment = {
	chain: StablecoinChainId
	symbol: StablecoinFeeAssetSymbol
	payloadOptions?: PayloadOptions
}

export type StablecoinFeeEstimateInput = {
	chain: StablecoinChainId
	symbol: StablecoinFeeAssetSymbol
	tx: SubmittableExtrinsic
	from: string
	payloadOptions?: PayloadOptions
}
