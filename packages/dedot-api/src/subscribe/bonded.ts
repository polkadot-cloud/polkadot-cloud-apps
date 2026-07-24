// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { removeBonded, setBonded } from 'global-bus'
import type { StakingChain } from '../types'

export class BondedQuery<T extends StakingChain> {
	#unsub: Unsub | undefined = undefined

	constructor(
		public api: DedotClient<T>,
		public address: string,
	) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.query.staking.bonded(
			this.address,
			async (result) => {
				if (result) {
					setBonded({
						stash: this.address,
						bonded: result.address(this.api.consts.system.ss58Prefix),
					})
				} else {
					removeBonded(this.address)
				}
			},
		)
	}

	unsubscribe() {
		this.#unsub?.()
		removeBonded(this.address)
	}
}
