// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { removeAccountBalance, setAccountBalance } from 'global-bus'
import type { AccountBalance, ChainId } from 'types'
import type { Chain } from '../types'

export class AccountBalanceQuery<T extends Chain> {
	#unsub: Unsub | undefined = undefined

	constructor(
		public api: DedotClient<T>,
		public chainId: ChainId,
		public address: string,
	) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.query.system.account(
			this.address,
			async ({ nonce, data }) => {
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
	}

	unsubscribe(removeBalance = true) {
		this.#unsub?.()
		if (removeBalance) {
			removeAccountBalance(this.chainId, this.address)
		}
	}
}
