// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import dotSvg from 'assets/token/dot.svg'
import hollarSvg from 'assets/token/hollar.svg'
import usdcSvg from 'assets/token/usdc.svg'
import usdtSvg from 'assets/token/usdt.svg'
import type {
	AssetMetadata,
	ChainAssetConfigs,
	FeeAssetSymbol,
	StablecoinChainConfig,
	StablecoinChainId,
	StablecoinSymbol,
} from 'types'
import { SystemChainList } from './networks'

// Shared display metadata for every supported fee token.
const FeeTokenMetadata: Record<FeeAssetSymbol, AssetMetadata> = {
	DOT: { color: '#E6007A', decimals: SystemChainList.statemint.units },
	USDC: { color: '#3E73C4', decimals: 6 },
	USDT: { color: '#26A17B', decimals: 6 },
	HOLLAR: { color: '#B3CF92', decimals: 18 },
}

const FeeTokenIcons: Record<FeeAssetSymbol, string> = {
	DOT: dotSvg,
	USDC: usdcSvg,
	USDT: usdtSvg,
	HOLLAR: hollarSvg,
}

// All supported transaction fee asset symbols.
export const FeeAssetSymbols = Object.keys(FeeTokenMetadata) as FeeAssetSymbol[]

// All supported stablecoin symbols, excluding the native DOT fee token.
export const StablecoinSymbols = FeeAssetSymbols.filter(
	(symbol): symbol is StablecoinSymbol => symbol !== 'DOT',
)

// Merges shared fee-token metadata into chain-specific asset configuration.
const withFeeTokenMetadata = (
	assets: ChainAssetConfigs,
): StablecoinChainConfig['assets'] =>
	Object.fromEntries(
		Object.entries(assets).map(([symbol, config]) => [
			symbol,
			{
				...config,
				...FeeTokenMetadata[symbol as FeeAssetSymbol],
			},
		]),
	)

// Stablecoin and fee-token configuration for each supported chain.
const StablecoinConfigs: Record<StablecoinChainId, StablecoinChainConfig> = {
	statemint: {
		label: 'Polkadot Hub',
		assets: withFeeTokenMetadata({
			DOT: {
				existentialDeposit: 10_000_000_000n,
			},
			USDC: {
				existentialDeposit: 700_000n,
				assetId: 1337,
			},
			USDT: {
				existentialDeposit: 700_000n,
				assetId: 1984,
			},
		}),
	},
	hydration: {
		label: 'Hydration',
		assets: withFeeTokenMetadata({
			DOT: {
				existentialDeposit: 17_540_000n,
				assetId: 5,
			},
			USDC: {
				existentialDeposit: 10_000n,
				assetId: 22,
			},
			USDT: {
				existentialDeposit: 10_000n,
				assetId: 10,
			},
			HOLLAR: {
				existentialDeposit: 100_000_000_000_000n,
				assetId: 222,
				erc20Contract: '0x531a654d1696ed52e7275a8cede955e82620f99a',
			},
		}),
	},
}

// All chains configured for stablecoin operations.
export const StablecoinChains = Object.keys(
	StablecoinConfigs,
) as StablecoinChainId[]

// Gets a stablecoin chain's display label.
export const getStablecoinChainLabel = (chain: StablecoinChainId) =>
	StablecoinConfigs[chain].label

// Gets an asset's chain-specific stablecoin configuration.
export const getStablecoinAssetConfig = (
	chain: StablecoinChainId,
	symbol: FeeAssetSymbol,
) => StablecoinConfigs[chain].assets[symbol]

// Gets a fee token's globally configured display color.
export const getFeeTokenColor = (symbol: FeeAssetSymbol) =>
	FeeTokenMetadata[symbol].color

// Gets a fee token's display icon.
export const getFeeTokenIcon = (symbol: FeeAssetSymbol) => FeeTokenIcons[symbol]

// Gets all configured fee assets for a chain.
export const getStablecoinFeeAssets = (
	chain: StablecoinChainId,
): FeeAssetSymbol[] =>
	Object.keys(StablecoinConfigs[chain].assets) as FeeAssetSymbol[]

// Checks whether a stablecoin can be sent on a chain.
export const isStablecoinSendAssetSupported = (
	chain: StablecoinChainId,
	symbol: StablecoinSymbol,
) => !!getStablecoinAssetConfig(chain, symbol)

// Checks whether an asset can pay transaction fees on a chain.
export const isStablecoinFeeAssetSupported = (
	chain: StablecoinChainId,
	symbol: FeeAssetSymbol,
) => !!getStablecoinAssetConfig(chain, symbol)

// Builds the Asset Hub XCM location for a local asset ID.
export const getAssetHubAssetLocation = (assetId: number) => ({
	parents: 0,
	interior: {
		type: 'X2' as const,
		value: [
			{ type: 'PalletInstance' as const, value: 50 },
			{ type: 'GeneralIndex' as const, value: BigInt(assetId) },
		] as const,
	},
})

// The Asset Hub XCM location for its native relay-chain asset.
export const AssetHubNativeAssetLocation = {
	parents: 1,
	interior: {
		type: 'Here',
	},
} as const
