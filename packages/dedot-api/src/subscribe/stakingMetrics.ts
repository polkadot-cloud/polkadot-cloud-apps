// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { defaultStakingMetrics, setStakingMetrics } from 'global-bus'
import type { StakingMetrics } from 'types'
import type { StakingChain } from '../types'

export class StakingMetricsQuery<T extends StakingChain> {
	stakingMetrics: StakingMetrics = defaultStakingMetrics

	#unsub: Unsub | undefined = undefined

	constructor(
		public api: DedotClient<T>,
		public era: number,
	) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.queryMulti(
			[
				{
					fn: this.api.query.balances.totalIssuance,
					args: [],
				},
				{
					fn: this.api.query.staking.minimumActiveStake,
					args: [],
				},
				{
					fn: this.api.query.staking.counterForValidators,
					args: [],
				},
				{
					fn: this.api.query.staking.maxValidatorsCount,
					args: [],
				},
				{
					fn: this.api.query.staking.validatorCount,
					args: [],
				},
				{
					fn: this.api.query.staking.erasValidatorReward,
					args: [this.era - 1],
				},
				{
					fn: this.api.query.staking.erasTotalStake,
					args: [Math.max(this.era - 1, 0)],
				},
				{
					fn: this.api.query.staking.minNominatorBond,
					args: [],
				},
				{
					fn: this.api.query.staking.erasTotalStake,
					args: [this.era],
				},
				{
					fn: this.api.query.staking.counterForNominators,
					args: [],
				},
			],
			([
				totalIssuance,
				minimumActiveStake,
				counterForValidators,
				maxValidatorsCount,
				validatorCount,
				lastReward,
				lastTotalStake,
				minNominatorBond,
				totalStaked,
				counterForNominators,
			]) => {
				this.stakingMetrics = {
					totalIssuance,
					minimumActiveStake,
					counterForValidators,
					maxValidatorsCount,
					validatorCount,
					lastReward,
					lastTotalStake,
					minNominatorBond,
					totalStaked,
					counterForNominators,
				}
				setStakingMetrics(this.stakingMetrics)
			},
		)
	}

	unsubscribe() {
		this.#unsub?.()
	}
}
