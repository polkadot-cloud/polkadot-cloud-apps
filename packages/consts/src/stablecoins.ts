// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	StablecoinAssetSymbol,
	StablecoinChainConfig,
	StablecoinChainId,
	StablecoinFeeAssetSymbol,
	StablecoinSymbol,
} from 'types'
import { getRpcEndpointList } from './rpc'

export const StablecoinChains: StablecoinChainId[] = ['statemint', 'hydration']

export const StablecoinSymbols: StablecoinSymbol[] = ['USDC', 'USDT', 'HOLLAR']

export const StablecoinFeeAssetSymbols: StablecoinFeeAssetSymbol[] = [
	'DOT',
	'USDC',
	'USDT',
	'HOLLAR',
]

export const StablecoinAssetDecimals: Record<StablecoinAssetSymbol, number> = {
	DOT: 10,
	USDC: 6,
	USDT: 6,
	HOLLAR: 18,
}

export const StablecoinConfigs: Record<
	StablecoinChainId,
	StablecoinChainConfig
> = {
	statemint: {
		id: 'statemint',
		label: 'Polkadot Hub',
		shortLabel: 'Polkadot Hub',
		rpcEndpoints: getRpcEndpointList('statemint'),
		sendAssets: ['USDC', 'USDT'],
		feeAssets: ['DOT', 'USDC', 'USDT'],
		assets: {
			DOT: {
				symbol: 'DOT',
				label: 'DOT',
				decimals: StablecoinAssetDecimals.DOT,
				existentialDeposit: 10_000_000_000n,
			},
			USDC: {
				symbol: 'USDC',
				label: 'USDC',
				decimals: StablecoinAssetDecimals.USDC,
				existentialDeposit: 700_000n,
				assetId: 1337,
			},
			USDT: {
				symbol: 'USDT',
				label: 'USDT',
				decimals: StablecoinAssetDecimals.USDT,
				existentialDeposit: 700_000n,
				assetId: 1984,
			},
		},
	},
	hydration: {
		id: 'hydration',
		label: 'Hydration',
		shortLabel: 'Hydration',
		rpcEndpoints: getRpcEndpointList('hydration'),
		sendAssets: ['USDC', 'USDT', 'HOLLAR'],
		feeAssets: ['DOT', 'USDC', 'USDT', 'HOLLAR'],
		assets: {
			DOT: {
				symbol: 'DOT',
				label: 'DOT',
				decimals: StablecoinAssetDecimals.DOT,
				existentialDeposit: 17_540_000n,
				assetId: 5,
			},
			USDC: {
				symbol: 'USDC',
				label: 'USDC',
				decimals: StablecoinAssetDecimals.USDC,
				existentialDeposit: 10_000n,
				assetId: 22,
			},
			USDT: {
				symbol: 'USDT',
				label: 'USDT',
				decimals: StablecoinAssetDecimals.USDT,
				existentialDeposit: 10_000n,
				assetId: 10,
			},
			HOLLAR: {
				symbol: 'HOLLAR',
				label: 'HOLLAR',
				decimals: StablecoinAssetDecimals.HOLLAR,
				existentialDeposit: 100_000_000_000_000n,
				assetId: 222,
				erc20Contract: '0x531a654d1696ed52e7275a8cede955e82620f99a',
			},
		},
	},
}

export const getStablecoinChainConfig = (chain: StablecoinChainId) =>
	StablecoinConfigs[chain]

export const getStablecoinAssetConfig = (
	chain: StablecoinChainId,
	symbol: StablecoinAssetSymbol,
) => StablecoinConfigs[chain].assets[symbol]

export const isStablecoinSendAssetSupported = (
	chain: StablecoinChainId,
	symbol: StablecoinSymbol,
) => StablecoinConfigs[chain].sendAssets.includes(symbol)

export const isStablecoinFeeAssetSupported = (
	chain: StablecoinChainId,
	symbol: StablecoinFeeAssetSymbol,
) => StablecoinConfigs[chain].feeAssets.includes(symbol)

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
