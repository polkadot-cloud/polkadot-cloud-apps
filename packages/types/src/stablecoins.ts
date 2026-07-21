// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'

export type StablecoinChainId = 'statemint' | 'hydration'

export type StablecoinSymbol = 'USDC' | 'USDT' | 'HOLLAR'

export type FeeAssetSymbol = 'DOT' | StablecoinSymbol

export type AssetMetadata = Pick<StablecoinAssetConfig, 'color' | 'decimals'>

export type ChainAssetConfigs = Partial<
	Record<FeeAssetSymbol, Omit<StablecoinAssetConfig, keyof AssetMetadata>>
>

export type StablecoinAssetConfig = {
	color: string
	decimals: number
	existentialDeposit: bigint
	assetId?: number
	erc20Contract?: string
}

export type StablecoinChainConfig = {
	label: string
	assets: Partial<Record<FeeAssetSymbol, StablecoinAssetConfig>>
}

export type StablecoinBalance = {
	chain: StablecoinChainId
	symbol: FeeAssetSymbol
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
	symbol: FeeAssetSymbol
	payloadOptions?: PayloadOptions
}

export type StablecoinFeeEstimateInput = {
	chain: StablecoinChainId
	symbol: FeeAssetSymbol
	tx: SubmittableExtrinsic
	from: string
	payloadOptions?: PayloadOptions
}
