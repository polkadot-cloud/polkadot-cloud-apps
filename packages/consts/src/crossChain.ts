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

export const isCrossChainAssetSupported = (
	from: StablecoinChainId,
	to: StablecoinChainId,
	symbol: string,
): symbol is CrossChainAsset =>
	isCrossChainAsset(symbol) &&
	from !== to &&
	!!getStablecoinAssetConfig(from, symbol) &&
	!!getStablecoinAssetConfig(to, symbol)

// Wait for the user to pause editing before simulating a new transfer.
export const CrossChainQuoteDebounceMs = 400

// Bound client initialization, simulation, and network fee estimation together.
export const CrossChainQuoteTimeoutMs = 45_000

// Destination confirmation window after the source transaction finalizes.
export const CrossChainDeliveryTimeoutMs = 120_000
