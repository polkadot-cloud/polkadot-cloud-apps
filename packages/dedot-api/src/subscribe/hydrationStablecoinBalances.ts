// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import {
	getStablecoinAssetConfig,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import type { DedotClient } from 'dedot'
import type { FeeAssetSymbol } from 'types'
import { toStablecoinBalance } from '../stablecoins/shared'
import {
	type BalanceCallback,
	type ErrorCallback,
	StablecoinBalancesSubscription,
} from './stablecoinBalances'

type SubscribableAsset = {
	assetId: number
	symbol: FeeAssetSymbol
}

const getSubscribableAssets = (): SubscribableAsset[] =>
	getStablecoinFeeAssets('hydration').flatMap((symbol) => {
		const config = getStablecoinAssetConfig('hydration', symbol)
		return config?.assetId !== undefined && !config.erc20Contract
			? [{ assetId: config.assetId, symbol }]
			: []
	})

// Subscribes to configured Hydration Tokens pallet balances, excluding ERC-20 assets.
export class HydrationStablecoinBalancesQuery extends StablecoinBalancesSubscription {
	constructor(
		private getApi: () => Promise<DedotClient<HydrationApi>>,
		private address: string,
		onBalance: BalanceCallback,
		onError: ErrorCallback,
	) {
		super(onBalance, onError)
		void this.#subscribe()
	}

	async #subscribe() {
		try {
			const api = await this.getApi()
			if (this.disposed) {
				return
			}

			const assets = getSubscribableAssets()
			if (!assets.length) {
				return
			}

			await this.track(() =>
				api.query.tokens.accounts.multi(
					assets.map<[string, number]>(({ assetId }) => [
						this.address,
						assetId,
					]),
					(accounts) => {
						accounts.forEach((account, index) => {
							const asset = assets[index]
							if (asset) {
								this.emit(
									toStablecoinBalance('hydration', asset.symbol, {
										free: account.free,
										frozen: account.frozen,
									}),
								)
							}
						})
					},
				),
			)
		} catch (error) {
			this.reportError(error)
		}
	}
}
