// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SwapPoolToken, SwapToken } from 'types'
import {
	AssetHubNativeAssetLocation,
	getAssetHubAssetLocation,
	getStablecoinAssetConfig,
} from './stablecoins'

export const SwapTokens: SwapToken[] = ['DOT', 'dotUSD', 'USDT', 'USDC']

export const SwapPoolTokens: SwapPoolToken[] = ['dotUSD', 'USDT', 'USDC']

// Default swap slippage tolerance in basis points (50 bps = 0.5%).
export const DefaultSwapSlippageBps = 50

// Highest supported slippage tolerance, shared by controls and transaction bounds.
export const MaxSwapSlippageBps = 500

// Maximum age of a usable swap quote, in milliseconds.
export const SwapQuoteExpiryMs = 30_000

export const swapAssetId = (token: SwapPoolToken) =>
	getStablecoinAssetConfig('statemint', token)!.assetId!

export const swapDecimals = (token: SwapToken) =>
	getStablecoinAssetConfig('statemint', token)!.decimals

export const swapLocation = (token: SwapToken) =>
	token === 'DOT'
		? AssetHubNativeAssetLocation
		: getAssetHubAssetLocation(swapAssetId(token))
