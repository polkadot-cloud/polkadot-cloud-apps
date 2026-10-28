// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	CombinedPoolReward,
	NominatorReward,
	PoolReward,
	RewardResult,
	StakingReward,
	ValidatorIncentiveReward,
} from './types'

export const isPoolReward = (p: RewardResult): p is PoolReward => 'poolId' in p

export const isPoolShareReward = (p: RewardResult): p is CombinedPoolReward =>
	isPoolReward(p) && p.source?.toLowerCase() === 'share'

export const isNominatorReward = (p: RewardResult): p is NominatorReward =>
	!isPoolReward(p) && p.type === 'nominator'

export const isValidatorIncentiveReward = (
	p: RewardResult,
): p is ValidatorIncentiveReward =>
	!isPoolReward(p) && p.type === 'validator-incentive'

export const splitStakingRewards = (rewards: StakingReward[]) => {
	const payouts: StakingReward[] = []
	const unclaimedPayouts: StakingReward[] = []
	for (const reward of rewards) {
		;(reward.claimed ? payouts : unclaimedPayouts).push(reward)
	}
	return { payouts, unclaimedPayouts }
}
