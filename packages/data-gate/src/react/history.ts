// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	COMBINED_POOL_REWARDS_DEFAULT,
	OPERATOR_LIST_DEFAULT,
	OPERATOR_STATS_DEFAULT,
	PAYEE_NOMINATOR_REWARDS_DEFAULT,
	POOL_ERA_REWARDS_DEFAULT,
	POOL_REWARDS_DEFAULT,
	REWARDS_DEFAULT,
	UNCLAIMED_REWARDS_DEFAULT,
	VALIDATOR_ERA_POINTS_DEFAULT,
	VALIDATOR_LIST_DEFAULT,
	VALIDATOR_RETAINMENT_DEFAULT,
	VALIDATOR_REWARDS_DEFAULT,
} from 'plugin-staking-api'
import type {
	OperatorListVariables,
	ValidatorListVariables,
} from 'plugin-staking-api/types'
import { operatorList, operatorStats } from '../resources/operators'
import {
	type ValidatorHistoryVariables,
	validatorPointHistory,
	validatorRewardHistory,
} from '../resources/performance'
import {
	type CombinedRewardsVariables,
	combinedPoolRewards,
	type PayeeRewardsVariables,
	type PoolRewardHistoryVariables,
	payeeRewards,
	poolEraRewards,
	poolRewardHistory,
	type RewardHistoryVariables,
	rewardHistory,
	unclaimedRewards,
} from '../resources/rewards'
import { validatorList, validatorRetainment } from '../resources/validators'
import type { ResourceDefinition } from '../types'
import { useDataResource } from './provider'

// These view adapters provide empty presentation values while preserving loading/error state.
// The resource cache itself never stores these defaults as a successful response.
const useHistory = <T>(definition: ResourceDefinition<T>, empty: T) => {
	const result = useDataResource(definition)
	return { ...result, data: result.data ?? empty, refetch: result.refresh }
}

type WithNetwork<T> = T & { network?: string }
export const useRewards = ({
	network: _,
	...variables
}: WithNetwork<RewardHistoryVariables>) =>
	useHistory(rewardHistory(variables), REWARDS_DEFAULT)
export const usePoolRewards = ({
	network: _,
	...variables
}: WithNetwork<PoolRewardHistoryVariables>) =>
	useHistory(poolRewardHistory(variables), POOL_REWARDS_DEFAULT)
export const useCombinedPoolRewards = (
	{ network: _, ...variables }: WithNetwork<CombinedRewardsVariables>,
	options?: { skip?: boolean },
) =>
	useHistory(
		combinedPoolRewards(variables, !options?.skip),
		COMBINED_POOL_REWARDS_DEFAULT,
	)
export const usePayeeNominatorRewards = ({
	network: _,
	skip,
	...variables
}: WithNetwork<PayeeRewardsVariables> & { skip?: boolean }) =>
	useHistory(payeeRewards(variables, !skip), PAYEE_NOMINATOR_REWARDS_DEFAULT)
export const useUnclaimedRewards = ({
	network: _,
	...variables
}: WithNetwork<Pick<RewardHistoryVariables, 'who' | 'fromEra'>>) =>
	useHistory(unclaimedRewards(variables), UNCLAIMED_REWARDS_DEFAULT)
export const useValidatorRewards = ({
	network: _,
	...variables
}: WithNetwork<ValidatorHistoryVariables>) =>
	useHistory(validatorRewardHistory(variables), VALIDATOR_REWARDS_DEFAULT)
export const useValidatorEraPoints = ({
	network: _,
	...variables
}: WithNetwork<ValidatorHistoryVariables>) =>
	useHistory(validatorPointHistory(variables), VALIDATOR_ERA_POINTS_DEFAULT)
export const useOperatorList = (
	{ network: _, ...variables }: OperatorListVariables,
	options?: { skip?: boolean },
) => useHistory(operatorList(variables, !options?.skip), OPERATOR_LIST_DEFAULT)
export const useOperatorStats = (
	_variables: { network: string },
	options?: { skip?: boolean },
) => useHistory(operatorStats(!options?.skip), OPERATOR_STATS_DEFAULT)

export const useValidatorList = ({
	network: _,
	...variables
}: ValidatorListVariables) =>
	useHistory(validatorList(variables), VALIDATOR_LIST_DEFAULT)

export const usePoolEraRewards = ({
	network: _,
	skip,
	...variables
}: WithNetwork<Pick<RewardHistoryVariables, 'who' | 'fromEra'>> & {
	skip?: boolean
}) => useHistory(poolEraRewards(variables, !skip), POOL_ERA_REWARDS_DEFAULT)

export const useValidatorRetainment = (
	{ validator }: { network?: string; validator: string },
	options?: { skip?: boolean },
) =>
	useHistory(
		validatorRetainment(validator, !options?.skip),
		VALIDATOR_RETAINMENT_DEFAULT,
	)
