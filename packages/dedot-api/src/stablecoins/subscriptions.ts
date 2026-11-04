// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ServiceInterface,
	StablecoinBalance,
	StablecoinChainId,
} from 'types'
import type { StablecoinAdapter } from './shared'

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
	adapters: Partial<Record<StablecoinChainId, StablecoinAdapter>>,
): ServiceInterface['stablecoins']['subscribe'] => {
	const subscriptions = new Map<string, SharedSubscription>()
	return {
		balances: (address, chain, onBalance, onError) => {
			const adapter = adapters[chain]
			if (!adapter) {
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
				entry.unsubscribe = adapter.subscribe(address, emitBalance, emitError)
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
