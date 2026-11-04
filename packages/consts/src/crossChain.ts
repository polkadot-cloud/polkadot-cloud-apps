// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { CrossChainAsset, StablecoinChainId } from 'types'
import { getStablecoinAssetConfig } from './stablecoins'

export const CrossChainAssets: readonly CrossChainAsset[] = [
	'DOT',
	'USDC',
	'USDT',
]

export const isCrossChainAsset = (symbol: string): symbol is CrossChainAsset =>
	CrossChainAssets.some((asset) => asset === symbol)

// People transfers use the supported system-chain route through Polkadot Hub.
export const CrossChainDestinations: Record<
	StablecoinChainId,
	readonly [StablecoinChainId, ...StablecoinChainId[]]
> = {
	statemint: ['hydration', 'people-polkadot'],
	hydration: ['statemint'],
	'people-polkadot': ['statemint'],
}

export const isCrossChainAssetSupported = (
	from: StablecoinChainId,
	to: StablecoinChainId,
	symbol: string,
): symbol is CrossChainAsset =>
	isCrossChainAsset(symbol) &&
	CrossChainDestinations[from].includes(to) &&
	!!getStablecoinAssetConfig(from, symbol) &&
	!!getStablecoinAssetConfig(to, symbol)

// Wait for the user to pause editing before simulating a new transfer.
export const CrossChainQuoteDebounceMs = 400

// Destination confirmation window after the source transaction finalizes.
export const CrossChainDeliveryTimeoutMs = 120_000
