// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import {
	isNominatorReward,
	isValidatorIncentiveReward,
} from 'plugin-staking-api'
import type { RewardResults } from 'plugin-staking-api/types'

// Project from the last completed era, including every claimed and unclaimed payout page. Ordinary
// validator payouts are kept separate from incentives so neither is counted twice.
export const getValidatorRewardProjection = (
	rewards: RewardResults,
	validator: string | null,
	activeEra: number,
	erasPerDay: number,
	units: number,
) => {
	let stakerReward = new BigNumber(0)
	let incentiveReward = new BigNumber(0)
	if (
		validator &&
		activeEra > 0 &&
		Number.isFinite(erasPerDay) &&
		erasPerDay > 0
	) {
		for (const reward of rewards) {
			if (
				(!isNominatorReward(reward) && !isValidatorIncentiveReward(reward)) ||
				reward.validator !== validator ||
				reward.era !== activeEra - 1
			) {
				continue
			}
			if (isValidatorIncentiveReward(reward)) {
				incentiveReward = incentiveReward.plus(reward.reward)
			} else {
				stakerReward = stakerReward.plus(reward.reward)
			}
		}
	}
	const annualize = (reward: BigNumber) =>
		reward
			.shiftedBy(-units)
			.multipliedBy(erasPerDay)
			.multipliedBy(365)
			.toNumber()

	return {
		annualReward: annualize(stakerReward.plus(incentiveReward)) || 0,
		annualIncentiveReward: annualize(incentiveReward) || 0,
	}
}
