// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { setBlockNumber } from 'global-bus'
import type { Chain } from '../types'

export class BlockNumberQuery<T extends Chain> {
	blockNumber: number = 0

	#unsub: Unsub | undefined = undefined

	constructor(public api: DedotClient<T>) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.query.system.number((result) => {
			if (result) {
				this.blockNumber = result
				setBlockNumber(this.blockNumber)
			}
		})
	}

	unsubscribe() {
		this.#unsub?.()
	}
}
