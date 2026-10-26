// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'

// Chains supported by stablecoin services; statemint identifies Polkadot Asset Hub.
export type StablecoinChainId = 'statemint' | 'hydration'

// Stablecoin symbols supported across Asset Hub and Hydration.
export type StablecoinSymbol = 'USDC' | 'USDT' | 'HOLLAR' | 'dotUSD'

// Token symbols available for transaction fee payment across supported chains.
export type FeeAssetSymbol = 'DOT' | StablecoinSymbol

// Token symbols accepted by asset transfer forms.
export type SendAssetSymbol = FeeAssetSymbol

// Shared display color and decimal precision for an asset.
export type AssetMetadata = Pick<StablecoinAssetConfig, 'color' | 'decimals'>

// Asset settings defined per chain, excluding shared display metadata.
export type ChainAssetConfigs = Partial<
	Record<FeeAssetSymbol, Omit<StablecoinAssetConfig, keyof AssetMetadata>>
>

// Display metadata, minimum balance, and chain identifiers for a supported asset.
export type StablecoinAssetConfig = {
	color: string
	decimals: number
	existentialDeposit: bigint
	assetId?: number
	erc20Contract?: string
}

// Display label and supported asset configurations for a chain.
export type StablecoinChainConfig = {
	label: string
	assets: Partial<Record<FeeAssetSymbol, StablecoinAssetConfig>>
}

// An account's free and frozen asset balances, minimum balance, and decimal precision.
export type StablecoinBalance = {
	chain: StablecoinChainId
	symbol: FeeAssetSymbol
	free: bigint
	frozen: bigint
	existentialDeposit: bigint
	decimals: number
}

// Chain, asset, recipient, and amount in base units for an asset transfer.
export type AssetTransferInput = {
	chain: StablecoinChainId
	symbol: SendAssetSymbol
	recipient: string
	amount: bigint
}

// Retained for consumers of the original stablecoin service API.
export type StablecoinTransferInput = AssetTransferInput

// Fee asset selection and signing options for a transaction on a supported chain.
export type StablecoinFeePayment = {
	chain: StablecoinChainId
	symbol: FeeAssetSymbol
	payloadOptions?: PayloadOptions
}

// Transaction, sender, fee asset, and signing options used to estimate transaction fees.
export type StablecoinFeeEstimateInput = {
	chain: StablecoinChainId
	symbol: FeeAssetSymbol
	tx: SubmittableExtrinsic
	from: string
	payloadOptions?: PayloadOptions
}
