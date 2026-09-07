// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	VALIDATOR_DETAILS_BATCH_QUERY,
	VALIDATOR_LIST_QUERY,
	VALIDATOR_RETAINMENT_QUERY,
	VALIDATOR_STATS_QUERY,
} from 'plugin-staking-api'
import type {
	ValidatorDetailsBatchData,
	ValidatorListData,
	ValidatorListVariables,
	ValidatorRetainmentData,
	ValidatorStats,
} from 'plugin-staking-api/types'
import type { Staker, Validator } from 'types'
import { queryStakingApi } from '../sources/stakingApi'
import type { ResourceDefinition } from '../types'

export const validatorOverviews = (): ResourceDefinition<Staker[]> => ({
	name: 'validatorOverviews',
	key: [],
	requires: ['era'],
	load: async ({ node, era }) =>
		(await node.query.erasStakersOverviewEntries(era)).map(
			([[, address], { own, total }]) => ({
				address,
				own: own.toString(),
				total: total.toString(),
				others: [],
			}),
		),
})

export const validatorEntries = (): ResourceDefinition<Validator[]> => ({
	name: 'validatorEntries',
	key: [],
	load: async ({ node }) =>
		(await node.query.validatorEntries()).map(([address, prefs]) => ({
			address,
			prefs: {
				commission: Number((prefs.commission / 10_000_000).toFixed(2)),
				blocked: prefs.blocked,
			},
		})),
})

export const validatorPreferences = (
	addresses: string[],
): ResourceDefinition<Validator[]> => ({
	name: 'validatorEntries',
	key: ['preferences', addresses],
	load: async ({ node }) =>
		(await node.query.validatorsMulti(addresses)).map((prefs, index) => ({
			address: addresses[index],
			prefs: {
				commission: Number((prefs.commission / 10_000_000).toFixed(2)),
				blocked: prefs.blocked,
			},
		})),
})

export const validatorStats = (): ResourceDefinition<ValidatorStats> => ({
	name: 'validatorStats',
	refreshIntervalMs: { 'staking-api': 60_000 },
	staleTimeMs: 55_000,
	key: [],
	requires: ['era'],
	load: ({ network, signal }) =>
		queryStakingApi(VALIDATOR_STATS_QUERY, { network }, signal),
})

export const validatorList = (
	variables: Omit<ValidatorListVariables, 'network'>,
): ResourceDefinition<ValidatorListData> => ({
	name: 'validatorList',
	key: [variables],
	load: ({ network, signal }) =>
		queryStakingApi(VALIDATOR_LIST_QUERY, { ...variables, network }, signal),
})

export const validatorDetails = (
	addresses: readonly string[],
	enabled = true,
): ResourceDefinition<ValidatorDetailsBatchData> => ({
	name: 'validatorDetails',
	key: [[...new Set(addresses)].sort()],
	requires: ['era'],
	enabled: enabled && addresses.length > 0,
	load: ({ network, era, erasPerDay, signal }) =>
		queryStakingApi(
			VALIDATOR_DETAILS_BATCH_QUERY,
			{
				network,
				validators: [...new Set(addresses)].sort(),
				fromEra: Math.max(era - 1, 0),
				rewardRateDepth: erasPerDay,
				eraPointsDepth: 30,
			},
			signal,
		),
})

export const validatorRetainment = (
	validator: string,
	enabled = true,
): ResourceDefinition<ValidatorRetainmentData> => ({
	name: 'validatorDetails',
	key: ['retainment', validator],
	enabled: enabled && !!validator,
	load: ({ network, signal }) =>
		queryStakingApi(VALIDATOR_RETAINMENT_QUERY, { network, validator }, signal),
})
