// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	COMBINED_POOL_REWARDS_QUERY,
	NOMINATOR_REWARD_TREND_QUERY,
	PAYEE_NOMINATOR_REWARDS_QUERY,
	POOL_ERA_REWARDS_QUERY,
	POOL_REWARD_TREND_QUERY,
	POOL_REWARDS_QUERY,
	REWARDS_QUERY,
	UNCLAIMED_REWARDS_QUERY,
} from 'plugin-staking-api'
import type {
	AllRewardsData,
	CombinedPoolRewardsData,
	NominatorRewardTrendData,
	PayeeNominatorRewardsData,
	PoolEraRewardsData,
	PoolRewardData,
	PoolRewardTrendData,
	UnclaimedRewardsData,
} from 'plugin-staking-api/types'
import { apiResource } from '../sources/apiResource'

export interface RewardHistoryVariables {
	who: string
	fromEra: number
	limit?: number
	offset?: number
}
export interface PoolRewardHistoryVariables {
	who: string
	from: number
	limit?: number
	offset?: number
}
export interface CombinedRewardsVariables {
	who: string
	first?: number
	after?: string
}
export interface PayeeRewardsVariables {
	payee: string
	days?: number
	fromEra?: number
}

export const rewardHistory = (
	variables: RewardHistoryVariables,
	enabled = true,
) =>
	apiResource<AllRewardsData>(
		'rewards',
		'history',
		REWARDS_QUERY,
		{ ...variables },
		enabled && !!variables.who,
	)
export const poolRewardHistory = (
	variables: PoolRewardHistoryVariables,
	enabled = true,
) =>
	apiResource<PoolRewardData>(
		'rewards',
		'poolHistory',
		POOL_REWARDS_QUERY,
		{ ...variables },
		enabled && !!variables.who,
	)
export const combinedPoolRewards = (
	variables: CombinedRewardsVariables,
	enabled = true,
) =>
	apiResource<CombinedPoolRewardsData>(
		'rewards',
		'combinedPoolHistory',
		COMBINED_POOL_REWARDS_QUERY,
		{ ...variables },
		enabled && !!variables.who,
	)
export const payeeRewards = (
	variables: PayeeRewardsVariables,
	enabled = true,
) =>
	apiResource<PayeeNominatorRewardsData>(
		'rewards',
		'payee',
		PAYEE_NOMINATOR_REWARDS_QUERY,
		{ ...variables },
		enabled && !!variables.payee,
	)
export const unclaimedRewards = (
	variables: Pick<RewardHistoryVariables, 'who' | 'fromEra'>,
) =>
	apiResource<UnclaimedRewardsData>(
		'rewards',
		'unclaimed',
		UNCLAIMED_REWARDS_QUERY,
		{ ...variables },
		!!variables.who,
	)
export const nominatorRewardTrend = (who: string, eras: number) =>
	apiResource<NominatorRewardTrendData>(
		'rewards',
		'nominatorTrend',
		NOMINATOR_REWARD_TREND_QUERY,
		{ who, eras },
		!!who,
	)
export const poolRewardTrend = (who: string, duration: number) =>
	apiResource<PoolRewardTrendData>(
		'rewards',
		'poolTrend',
		POOL_REWARD_TREND_QUERY,
		{ who, duration },
		!!who,
	)

export const poolEraRewards = (
	variables: Pick<RewardHistoryVariables, 'who' | 'fromEra'>,
	enabled = true,
) =>
	apiResource<PoolEraRewardsData>(
		'rewards',
		'poolEra',
		POOL_ERA_REWARDS_QUERY,
		{ ...variables },
		enabled && !!variables.who,
	)
