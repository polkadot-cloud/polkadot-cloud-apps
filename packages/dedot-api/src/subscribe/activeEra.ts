// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { defaultActiveEra, setActiveEra } from 'global-bus'
import { Subject } from 'rxjs'
import type { ActiveEra } from 'types'
import type { StakingChain } from '../types'

export class ActiveEraQuery<T extends StakingChain> {
	activeEra: ActiveEra = defaultActiveEra
	activeEra$ = new Subject<ActiveEra>()

	#unsub: Unsub | undefined = undefined

	#setValue(newValue: ActiveEra) {
		this.activeEra$.next(newValue)
		setActiveEra(this.activeEra)
	}

	constructor(public api: DedotClient<T>) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.query.staking.activeEra((result) => {
			if (result) {
				this.activeEra = {
					index: result.index,
					start: result.start || 0n,
				}
				this.#setValue(this.activeEra)
			}
		})
	}

	unsubscribe() {
		this.#unsub?.()
	}
}
