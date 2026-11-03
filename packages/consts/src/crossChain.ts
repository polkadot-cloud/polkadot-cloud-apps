// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { CrossChainAsset, StablecoinChainId } from 'types'

export const CrossChainAssets: readonly CrossChainAsset[] = [
	'DOT',
	'USDC',
	'USDT',
]

export const isCrossChainAsset = (symbol: string): symbol is CrossChainAsset =>
	CrossChainAssets.some((asset) => asset === symbol)

export const crossChainDestination = (
	from: StablecoinChainId,
): StablecoinChainId => (from === 'statemint' ? 'hydration' : 'statemint')

// Wait for the user to pause editing before simulating a new transfer.
export const CrossChainQuoteDebounceMs = 400

// Destination confirmation window after the source transaction finalizes.
export const CrossChainDeliveryTimeoutMs = 120_000
