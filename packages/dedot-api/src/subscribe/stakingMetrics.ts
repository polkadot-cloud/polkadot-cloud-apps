// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { defaultStakingMetrics, setStakingMetrics } from 'global-bus'
import type { StakingMetrics } from 'types'
import type { StakingChain } from '../types'

export class StakingMetricsQuery<T extends StakingChain> {
	stakingMetrics: StakingMetrics = defaultStakingMetrics

	#unsubs: Unsub[] = []

	constructor(
		public api: DedotClient<T>,
		public era: number,
	) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		const lastEra = Math.max(this.era - 1, 0)
		const unsub = await this.api.queryMulti(
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
					args: [lastEra],
				},
				{
					fn: this.api.query.staking.erasTotalStake,
					args: [lastEra],
				},
				{
					fn: this.api.query.staking.minNominatorBond,
					args: [],
				},
				{
					fn: this.api.query.staking.minValidatorBond,
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
				minValidatorBond,
				totalStaked,
				counterForNominators,
			]) => {
				this.stakingMetrics = {
					...this.stakingMetrics,
					totalIssuance,
					minimumActiveStake,
					counterForValidators,
					maxValidatorsCount,
					validatorCount,
					lastReward,
					lastTotalStake,
					minNominatorBond,
					minValidatorBond,
					totalStaked,
					counterForNominators,
				}
				setStakingMetrics(this.stakingMetrics)
			},
		)
		this.#unsubs.push(unsub)

		// Check if the chain has the `erasValidatorIncentiveBudget` storage item before subscribing to
		// it
		const hasValidatorIncentiveBudget = this.api.registry.metadata.pallets
			.find(({ name }) => name === 'Staking')
			?.storage?.entries.some(
				({ name }) => name === 'ErasValidatorIncentiveBudget',
			)

		// If the chain has the `erasValidatorIncentiveBudget` storage item, subscribe to it
		if (hasValidatorIncentiveBudget) {
			const incentiveUnsub =
				await this.api.query.staking.erasValidatorIncentiveBudget(
					lastEra,
					(lastValidatorIncentiveBudget: bigint) => {
						this.stakingMetrics = {
							...this.stakingMetrics,
							lastValidatorIncentiveBudget,
						}
						setStakingMetrics(this.stakingMetrics)
					},
				)
			this.#unsubs.push(incentiveUnsub)
		}
	}

	unsubscribe() {
		for (const unsub of this.#unsubs) {
			unsub()
		}
	}
}
