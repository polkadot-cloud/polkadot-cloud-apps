// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import {
	getStablecoinAssetConfig,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import type { DedotClient } from 'dedot'
import type { FeeAssetSymbol } from 'types'
import { toStablecoinBalance, zeroBalance } from '../stablecoins/shared'
import {
	type BalanceCallback,
	type ErrorCallback,
	StablecoinBalancesSubscription,
} from './stablecoinBalances'

// Subscribes to every configured Asset Hub fee-token balance for one account.
export class AssetHubStablecoinBalancesQuery extends StablecoinBalancesSubscription {
	constructor(
		private api: DedotClient<PolkadotAssetHubApi>,
		private address: string,
		onBalance: BalanceCallback,
		onError: ErrorCallback,
	) {
		super(onBalance, onError)
		void this.#subscribe()
	}

	async #subscribe() {
		const subscriptions = [
			this.track(() =>
				this.api.query.system.account(this.address, ({ data }) => {
					this.emit(
						toStablecoinBalance('statemint', 'DOT', {
							free: data.free,
							frozen: data.frozen,
						}),
					)
				}),
			),
		]

		for (const symbol of getStablecoinFeeAssets('statemint')) {
			if (symbol === 'DOT') {
				continue
			}

			const config = getStablecoinAssetConfig('statemint', symbol)
			if (config?.assetId === undefined) {
				continue
			}

			subscriptions.push(this.#subscribeAsset(symbol, config.assetId))
		}

		await Promise.all(subscriptions)
	}

	#subscribeAsset(symbol: FeeAssetSymbol, assetId: number) {
		return this.track(() =>
			this.api.query.assets.account([assetId, this.address], (account) => {
				this.emit(
					account
						? toStablecoinBalance('statemint', symbol, {
								free: account.balance,
								frozen: account.status === 'Frozen' ? account.balance : 0n,
							})
						: zeroBalance('statemint', symbol),
				)
			}),
		)
	}
}
