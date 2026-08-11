// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { defaultEraRewardPoints, setEraRewardPoints } from 'global-bus'
import type { EraRewardPoints } from 'types'
import type { StakingChain } from '../types'

// erasRewardPoints emits roughly every block (~6s) as points accrue, but the
// data only feeds a relative-performance graph and accumulates over an era
// (hours). ss58-encoding all ~600 individual accounts on every emission is
// wasteful, so the encode + publish is throttled to at most once per interval.
// Blocks stream throughout an era, so a leading-edge throttle keeps the data at
// most ~THROTTLE_MS stale, and a fresh query instance publishes immediately at
// the start of each era.
const THROTTLE_MS = 30_000

export class EraRewardPointsQuery<T extends StakingChain> {
	eraRewardPoints: EraRewardPoints = defaultEraRewardPoints

	#unsub: Unsub | undefined = undefined

	// Timestamp of the last encode + publish, used to throttle subsequent ones
	#lastPublished = 0

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
				if (!result || Date.now() - this.#lastPublished < THROTTLE_MS) {
					return
				}
				this.#lastPublished = Date.now()
				this.eraRewardPoints = {
					total: result.total,
					individual: result.individual.map(([account, num]) => [
						account.address(this.api.consts.system.ss58Prefix),
						num,
					]),
				}
				setEraRewardPoints(this.eraRewardPoints)
			},
		)
	}

	unsubscribe() {
		this.#unsub?.()
	}
}
