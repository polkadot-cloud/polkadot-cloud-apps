// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AssetHubPoolToken, AssetHubToken } from 'types'
import {
	AssetHubNativeAssetLocation,
	getAssetHubAssetLocation,
	getStablecoinAssetConfig,
} from './stablecoins'

export const AssetHubTokens: AssetHubToken[] = ['DOT', 'dotUSD', 'USDT', 'USDC']
export const AssetHubPoolTokens: AssetHubPoolToken[] = [
	'dotUSD',
	'USDT',
	'USDC',
]
export const assetHubAssetId = (token: AssetHubPoolToken) =>
	getStablecoinAssetConfig('statemint', token)!.assetId!
export const assetHubDecimals = (token: AssetHubToken) =>
	getStablecoinAssetConfig('statemint', token)!.decimals
export const assetHubLocation = (token: AssetHubToken) =>
	token === 'DOT'
		? AssetHubNativeAssetLocation
		: getAssetHubAssetLocation(assetHubAssetId(token))
