// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	VALIDATOR_AVG_REWARD_RATE_BATCH_QUERY,
	VALIDATOR_ERA_POINTS_BATCH_QUERY,
	VALIDATOR_ERA_POINTS_QUERY,
	VALIDATOR_REWARDS_QUERY,
} from 'plugin-staking-api'
import type {
	ValidatorAvgRewardRateBatchData,
	ValidatorEraPointsBatchData,
	ValidatorEraPointsData,
	ValidatorRewardsData,
} from 'plugin-staking-api/types'
import { calculateValidatorEraRewardRate } from 'utils'
import { apiResource } from '../sources/apiResource'
import { mapInBatches } from '../sources/node'
import { queryStakingApi } from '../sources/stakingApi'
import type { ResourceDefinition } from '../types'
import { validatorStats } from './validators'

export interface PreviousEraRewards {
	era: number
	points: { total: number; individual: [string, number][] }
	payout: bigint
}

export const previousEraRewards =
	(): ResourceDefinition<PreviousEraRewards> => ({
		name: 'previousEraRewards',
		key: [],
		requires: ['era'],
		load: async ({ node, era, ss58 }) => {
			const [points, payout] = await Promise.all([
				node.query.erasRewardPoints(era - 1),
				node.query.erasValidatorReward(era - 1),
			])
			if (!points || payout === undefined)
				throw new Error('Previous era rewards are not available yet')
			return {
				era: era - 1,
				payout,
				points: {
					total: points.total,
					individual: points.individual.map(([who, value]) => [
						who.address(ss58),
						value,
					]),
				},
			}
		},
	})

export const validatorRewardRates = (
	addresses: readonly string[],
	enabled = true,
	fromEra?: number,
): ResourceDefinition<ValidatorAvgRewardRateBatchData> => {
	const unique = [...new Set(addresses)].sort()
	return {
		name: 'validatorPerformance',
		key: ['rates', unique, fromEra],
		requires: fromEra === undefined ? ['era'] : [],
		enabled: enabled && unique.length > 0,
		load: async (context) => {
			if (context.policy.sources.validatorPerformance === 'staking-api')
				return queryStakingApi(
					VALIDATOR_AVG_REWARD_RATE_BATCH_QUERY,
					{
						chain: context.network,
						validators: unique,
						fromEra: fromEra ?? Math.max(context.era - 1, 0),
						depth: context.erasPerDay,
					},
					context.signal,
				)
			const { points, payout, era } = await context.request(
				previousEraRewards(),
			)
			const values = new Map(points.individual)
			const rates = await mapInBatches(unique, async (validator) => {
				const overview = await context.node.query.erasStakersOverview(
					era,
					validator,
				)
				const reward =
					points.total > 0
						? (payout * BigInt(values.get(validator) ?? 0)) /
							BigInt(points.total)
						: 0n
				return {
					validator,
					rate: calculateValidatorEraRewardRate(
						context.erasPerDay,
						overview?.total ?? 0n,
						reward,
						context.units,
					),
				}
			})
			return { validatorAvgRewardRateBatch: rates }
		},
	}
}

export const validatorEraPoints = (
	addresses: readonly string[],
	fromEra: number,
	depth = 30,
	enabled = true,
): ResourceDefinition<ValidatorEraPointsBatchData> => ({
	name: 'validatorHistory',
	key: ['points', [...new Set(addresses)].sort(), fromEra, depth],
	enabled: enabled && addresses.length > 0,
	load: async ({ network, signal, policy }) => {
		if (policy.sources.validatorPerformance !== 'staking-api')
			throw new Error('Historical era points require the staking API')
		return queryStakingApi(
			VALIDATOR_ERA_POINTS_BATCH_QUERY,
			{ network, validators: addresses, fromEra, depth },
			signal,
		)
	},
})

export const averageEraReward = (
	days: number,
	historyDepth: number,
	enabled = true,
): ResourceDefinition<{ days: number; reward: bigint }> => ({
	name: 'averageEraReward',
	key: [days, historyDepth],
	requires: ['era'],
	enabled,
	load: async ({ node, era, erasPerDay }) => {
		const depth = Math.max(
			1,
			Math.min(era, historyDepth, Math.floor(days * erasPerDay)),
		)
		const eras = Array.from({ length: depth }, (_, i) => era - i - 1)
		const rewards = await node.query.erasValidatorRewardMulti(eras)
		if (
			rewards.length !== eras.length ||
			rewards.some((reward) => reward === undefined)
		)
			throw new Error('Historical era rewards are not available yet')
		return {
			days,
			reward:
				rewards.reduce<bigint>((sum, reward) => sum + (reward ?? 0n), 0n) /
				BigInt(depth),
		}
	},
})

export interface ValidatorHistoryVariables {
	validator: string
	fromEra: number
	depth?: number
}
export const validatorRewardHistory = (variables: ValidatorHistoryVariables) =>
	apiResource<ValidatorRewardsData>(
		'validatorHistory',
		'rewards',
		VALIDATOR_REWARDS_QUERY,
		{ ...variables },
		!!variables.validator,
	)
export const validatorPointHistory = (variables: ValidatorHistoryVariables) =>
	apiResource<ValidatorEraPointsData>(
		'validatorHistory',
		'points',
		VALIDATOR_ERA_POINTS_QUERY,
		{ ...variables },
		!!variables.validator,
	)

export const averageRewardInputs = (
	days: number,
	historyDepth: number,
): ResourceDefinition<{
	apiRate: number
	average: { days: number; reward: bigint }
}> => ({
	name: 'averageRewardInputs',
	key: [days, historyDepth],
	requires: ['era'],
	refreshIntervalMs: { 'staking-api': 60_000 },
	load: async (context) => {
		if (context.policy.sources.averageRewardInputs === 'staking-api') {
			try {
				const stats = await context.request(validatorStats())
				const rate = stats.averageRewardRate.rate
				if (Number.isFinite(rate) && rate > 0)
					return { apiRate: rate, average: { days: 0, reward: 0n } }
			} catch {
				// The average rate explicitly supports a bounded historical-payout fallback. Nomination
				// status, validator details and all other API resources preserve errors without fallback.
			}
		}
		return {
			apiRate: 0,
			average: await context.request(averageEraReward(days, historyDepth)),
		}
	},
})
