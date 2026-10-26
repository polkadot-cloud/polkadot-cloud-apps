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

export const swapAssetId = (token: SwapPoolToken) =>
	getStablecoinAssetConfig('statemint', token)!.assetId!

export const swapDecimals = (token: SwapToken) =>
	getStablecoinAssetConfig('statemint', token)!.decimals

export const swapLocation = (token: SwapToken) =>
	token === 'DOT'
		? AssetHubNativeAssetLocation
		: getAssetHubAssetLocation(swapAssetId(token))
