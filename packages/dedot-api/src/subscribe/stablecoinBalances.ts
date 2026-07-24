// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Unsub } from 'dedot/types'
import type { StablecoinBalance } from 'types'

export type BalanceCallback = (balance: StablecoinBalance) => void
export type ErrorCallback = (error: unknown) => void

// Shared lifecycle for stablecoin storage subscriptions.
export abstract class StablecoinBalancesSubscription {
	#disposed = false
	#unsubs: Unsub[] = []

	protected constructor(
		private onBalance: BalanceCallback,
		private onError: ErrorCallback,
	) {}

	protected get disposed() {
		return this.#disposed
	}

	protected reportError(error: unknown) {
		if (this.#disposed) {
			return
		}

		try {
			this.onError(error)
		} catch {
			// Error callbacks must not break subscription setup or updates.
		}
	}

	protected emit(balance: StablecoinBalance | undefined) {
		if (this.#disposed || !balance) {
			return
		}

		try {
			this.onBalance(balance)
		} catch (error) {
			this.reportError(error)
		}
	}

	protected async track(createSubscription: () => Promise<Unsub>) {
		if (this.#disposed) {
			return
		}

		try {
			const unsub = await createSubscription()
			if (this.#disposed) {
				unsub()
			} else {
				this.#unsubs.push(unsub)
			}
		} catch (error) {
			this.reportError(error)
		}
	}

	unsubscribe() {
		this.#disposed = true
		for (const unsub of this.#unsubs.splice(0)) {
			unsub()
		}
	}
}
