// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { DedotClient } from 'dedot'
import type { ServiceInterface, StablecoinBalance } from 'types'
import { AssetHubStablecoinBalancesQuery } from '../subscribe/assetHubStablecoinBalances'
import { HydrationStablecoinBalancesQuery } from '../subscribe/hydrationStablecoinBalances'
import type { DedotServiceFeatures } from '../types'

type Listener = {
	onBalance: (balance: StablecoinBalance) => void
	onError: (error: unknown) => void
}
type SharedSubscription = {
	listeners: Set<Listener>
	balances: Map<string, StablecoinBalance>
	unsubscribe: () => void
}

const notifyError = (listener: Listener, error: unknown) => {
	try {
		listener.onError(error)
	} catch {
		// One consumer must not interrupt updates for the other subscribers.
	}
}
const notifyBalance = (listener: Listener, balance: StablecoinBalance) => {
	try {
		listener.onBalance(balance)
	} catch (error) {
		notifyError(listener, error)
	}
}

// Imported accounts and temporary delivery watchers share the same storage subscriptions.
export const createStablecoinSubscriptions = (
	apiHub: DedotClient<PolkadotAssetHubApi>,
	getHydrationApi: () => Promise<DedotClient<HydrationApi>>,
	features: DedotServiceFeatures['stablecoins'],
): ServiceInterface['stablecoins']['subscribe'] => {
	const subscriptions = new Map<string, SharedSubscription>()
	return {
		balances: (address, chain, onBalance, onError) => {
			if (!(chain === 'statemint' ? features.assetHub : features.hydration)) {
				onError(new Error(`Balance subscriptions unavailable for ${chain}`))
				return () => {}
			}
			const key = `${chain}:${address}`
			const listener = { onBalance, onError }
			let shared = subscriptions.get(key)
			if (shared) {
				shared.listeners.add(listener)
				for (const balance of shared.balances.values())
					notifyBalance(listener, balance)
			} else {
				const entry: SharedSubscription = {
					listeners: new Set([listener]),
					balances: new Map(),
					unsubscribe: () => {},
				}
				shared = entry
				subscriptions.set(key, entry)
				const emitBalance = (balance: StablecoinBalance) => {
					entry.balances.set(balance.symbol, balance)
					for (const subscriber of entry.listeners) {
						notifyBalance(subscriber, balance)
					}
				}
				const emitError = (error: unknown) => {
					for (const subscriber of entry.listeners)
						notifyError(subscriber, error)
				}
				const subscription =
					chain === 'statemint'
						? new AssetHubStablecoinBalancesQuery(
								apiHub,
								address,
								emitBalance,
								emitError,
							)
						: new HydrationStablecoinBalancesQuery(
								getHydrationApi,
								address,
								emitBalance,
								emitError,
							)
				entry.unsubscribe = () => subscription.unsubscribe()
			}
			const active = shared
			return () => {
				if (active.listeners.delete(listener) && !active.listeners.size) {
					subscriptions.delete(key)
					active.unsubscribe()
				}
			}
		},
	}
}
