// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AssetHubPoolToken, AssetHubToken } from 'types'
import {
	AssetHubNativeAssetLocation,
	getAssetHubAssetLocation,
} from './stablecoins'

export const AssetHubTokens: AssetHubToken[] = ['DOT', 'dotUSD', 'USDT', 'USDC']
export const AssetHubPoolTokens: AssetHubPoolToken[] = [
	'dotUSD',
	'USDT',
	'USDC',
]
export const AssetHubAssetIds = {
	dotUSD: 7873,
	USDT: 1984,
	USDC: 1337,
} as const
export const assetHubDecimals = (token: AssetHubToken) =>
	token === 'DOT' ? 10 : 6
export const assetHubLocation = (token: AssetHubToken) =>
	token === 'DOT'
		? AssetHubNativeAssetLocation
		: getAssetHubAssetLocation(AssetHubAssetIds[token])
