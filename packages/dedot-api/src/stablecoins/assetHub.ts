// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import {
	AssetHubNativeAssetLocation,
	getAssetHubAssetLocation,
	getStablecoinAssetConfig,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import type { DedotClient } from 'dedot'
import { asTx } from '../util'
import type { BalancePair, StablecoinAdapter } from './shared'
import { toStablecoinBalance, zeroBalance } from './shared'

// Reads the native Asset Hub account balance from the System pallet.
const fetchAssetHubNativeBalance = async (
	api: DedotClient<PolkadotAssetHubApi>,
	address: string,
): Promise<BalancePair> => {
	const info = await api.query.system.account(address)
	return {
		free: info.data.free,
		frozen: info.data.frozen,
	}
}

// Reads a non-native Asset Hub asset balance from the Assets pallet.
const fetchAssetHubAssetBalance = async (
	api: DedotClient<PolkadotAssetHubApi>,
	address: string,
	assetId: number,
): Promise<BalancePair> => {
	const info = await api.query.assets.account([assetId, address])
	if (!info) {
		return { free: 0n, frozen: 0n }
	}

	return {
		free: info.balance,
		frozen: info.status === 'Frozen' ? info.balance : 0n,
	}
}

// Creates the Polkadot Asset Hub stablecoin adapter.
export const createAssetHubStablecoinAdapter = (
	api: DedotClient<PolkadotAssetHubApi>,
): StablecoinAdapter => ({
	feeAssets: getStablecoinFeeAssets('statemint'),
	balance: async (address, symbol) => {
		const config = getStablecoinAssetConfig('statemint', symbol)
		if (!config) {
			return zeroBalance('statemint', symbol)
		}

		try {
			if (symbol === 'DOT') {
				return toStablecoinBalance(
					'statemint',
					symbol,
					await fetchAssetHubNativeBalance(api, address),
				)
			}
			if (config.assetId === undefined) {
				return zeroBalance('statemint', symbol)
			}
			return toStablecoinBalance(
				'statemint',
				symbol,
				await fetchAssetHubAssetBalance(api, address, config.assetId),
			)
		} catch {
			return zeroBalance('statemint', symbol)
		}
	},
	transfer: async ({ symbol, recipient, amount }) => {
		const config = getStablecoinAssetConfig('statemint', symbol)
		if (config?.assetId === undefined) {
			return undefined
		}

		return asTx(
			api.tx.assets.transferKeepAlive(config.assetId, recipient, amount),
		)
	},
	paymentOptions: (symbol) => {
		if (symbol === 'DOT') {
			return undefined
		}

		const config = getStablecoinAssetConfig('statemint', symbol)
		if (config?.assetId === undefined) {
			return undefined
		}

		return {
			assetId: getAssetHubAssetLocation(config.assetId),
		}
	},
	estimateFee: async ({ symbol, tx, from, payloadOptions }) => {
		const { partialFee: nativeFee } = await tx.paymentInfo(from, payloadOptions)

		if (symbol === 'DOT') {
			return nativeFee
		}

		const config = getStablecoinAssetConfig('statemint', symbol)
		if (config?.assetId === undefined) {
			return nativeFee
		}

		const assetFee =
			await api.call.assetConversionApi.quotePriceTokensForExactTokens(
				getAssetHubAssetLocation(config.assetId),
				AssetHubNativeAssetLocation,
				nativeFee,
				true,
			)

		if (assetFee === undefined) {
			throw new Error(`Unable to quote ${symbol} transaction fee`)
		}

		return assetFee
	},
})
