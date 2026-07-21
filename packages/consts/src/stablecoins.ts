// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	StablecoinAssetConfig,
	StablecoinAssetSymbol,
	StablecoinChainConfig,
	StablecoinChainId,
	StablecoinFeeAssetSymbol,
	StablecoinSymbol,
} from 'types'
import { SystemChainList } from './networks'

const StablecoinAssetDecimals: Record<StablecoinAssetSymbol, number> = {
	DOT: SystemChainList.statemint.units,
	USDC: 6,
	USDT: 6,
	HOLLAR: 18,
}

export const StablecoinFeeAssetSymbols = Object.keys(
	StablecoinAssetDecimals,
) as StablecoinFeeAssetSymbol[]

export const StablecoinSymbols = StablecoinFeeAssetSymbols.filter(
	(symbol): symbol is StablecoinSymbol => symbol !== 'DOT',
)

type ChainAssetConfigs = Partial<
	Record<StablecoinAssetSymbol, Omit<StablecoinAssetConfig, 'decimals'>>
>

const withAssetDecimals = (
	assets: ChainAssetConfigs,
): StablecoinChainConfig['assets'] =>
	Object.fromEntries(
		Object.entries(assets).map(([symbol, config]) => [
			symbol,
			{
				...config,
				decimals: StablecoinAssetDecimals[symbol as StablecoinAssetSymbol],
			},
		]),
	)

export const StablecoinConfigs: Record<
	StablecoinChainId,
	StablecoinChainConfig
> = {
	statemint: {
		label: 'Polkadot Hub',
		assets: withAssetDecimals({
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
		assets: withAssetDecimals({
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

export const StablecoinChains = Object.keys(
	StablecoinConfigs,
) as StablecoinChainId[]

export const getStablecoinAssetConfig = (
	chain: StablecoinChainId,
	symbol: StablecoinAssetSymbol,
) => StablecoinConfigs[chain].assets[symbol]

export const getStablecoinFeeAssets = (
	chain: StablecoinChainId,
): StablecoinFeeAssetSymbol[] =>
	Object.keys(StablecoinConfigs[chain].assets) as StablecoinFeeAssetSymbol[]

export const isStablecoinSendAssetSupported = (
	chain: StablecoinChainId,
	symbol: StablecoinSymbol,
) => !!getStablecoinAssetConfig(chain, symbol)

export const isStablecoinFeeAssetSupported = (
	chain: StablecoinChainId,
	symbol: StablecoinFeeAssetSymbol,
) => !!getStablecoinAssetConfig(chain, symbol)

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

export const getAssetHubNativeAssetLocation = () => ({
	parents: 1,
	interior: {
		type: 'Here' as const,
	},
})
