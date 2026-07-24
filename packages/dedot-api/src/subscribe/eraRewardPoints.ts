// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { defaultEraRewardPoints, setEraRewardPoints } from 'global-bus'
import type { EraRewardPoints } from 'types'
import type { StakingChain } from '../types'

export class EraRewardPointsQuery<T extends StakingChain> {
	eraRewardPoints: EraRewardPoints = defaultEraRewardPoints

	#unsub: Unsub | undefined = undefined

	constructor(
		public api: DedotClient<T>,
		public era: number,
	) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.query.staking.erasRewardPoints(
			this.era,
			(result) => {
				if (result) {
					this.eraRewardPoints = {
						total: result.total,
						individual: result.individual.map(([account, num]) => [
							account.address(this.api.consts.system.ss58Prefix),
							num,
						]),
					}
					setEraRewardPoints(this.eraRewardPoints)
				}
			},
		)
	}

	unsubscribe() {
		this.#unsub?.()
	}
}
