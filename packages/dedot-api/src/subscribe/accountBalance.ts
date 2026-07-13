// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SyncTimeoutDuration } from 'consts'
import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import {
	defaultAccountBalance,
	removeAccountBalance,
	setAccountBalance,
} from 'global-bus'
import type { AccountBalance, ChainId } from 'types'
import type { Chain } from '../types'

export class AccountBalanceQuery<T extends Chain> {
	#unsub: Unsub | undefined = undefined
	#syncTimeout: ReturnType<typeof setTimeout> | undefined = undefined
	#synced = false

	constructor(
		public api: DedotClient<T>,
		public chainId: ChainId,
		public address: string,
	) {
		this.api = api
		// If the subscription has not delivered data within the sync timeout
		// window (e.g. on a slow or unresponsive RPC), mark the balance as synced
		// with default data so the UI does not hang indefinitely. The live
		// subscription stays active and overwrites this once real data arrives.
		this.#syncTimeout = setTimeout(() => {
			this.#markSyncedFallback()
		}, SyncTimeoutDuration)
		this.subscribe()
	}

	async subscribe() {
		try {
			this.#unsub = await this.api.query.system.account(
				this.address,
				async ({ nonce, data }) => {
					this.#synced = true
					this.#clearSyncTimeout()
					const balances: AccountBalance = {
						synced: true,
						nonce,
						balance: {
							free: data.free,
							reserved: data.reserved,
							frozen: data.frozen,
						},
					}
					setAccountBalance(this.chainId, this.address, balances)
				},
			)
		} catch {
			// The subscription failed to establish; unblock the UI with defaults
			this.#markSyncedFallback()
		}
	}

	// Marks the balance as synced with default data if real data has not yet
	// arrived, so consumers waiting on `synced` are not blocked indefinitely
	#markSyncedFallback() {
		this.#clearSyncTimeout()
		if (!this.#synced) {
			setAccountBalance(this.chainId, this.address, {
				...defaultAccountBalance,
				synced: true,
			})
		}
	}

	#clearSyncTimeout() {
		if (this.#syncTimeout) {
			clearTimeout(this.#syncTimeout)
			this.#syncTimeout = undefined
		}
	}

	unsubscribe(removeBalance = true) {
		this.#clearSyncTimeout()
		this.#unsub?.()
		if (removeBalance) {
			removeAccountBalance(this.chainId, this.address)
		}
	}
}
