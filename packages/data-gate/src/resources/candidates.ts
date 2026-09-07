// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getValidatorCandidateQuery,
	OPTIMAL_VALIDATOR_BATCH_QUERY,
	SANITIZE_NOMINEE_CANDIDATES_QUERY,
	SEARCH_VALIDATORS_QUERY,
} from 'plugin-staking-api'
import type {
	OptimalValidatorBatchData,
	SanitizeNomineeCandidate,
	SanitizeNomineeCandidatesData,
	SearchValidatorsData,
	ValidatorCandidate,
	ValidatorCandidateStrategy,
} from 'plugin-staking-api/types'
import type { Validator } from 'types'
import { apiResource } from '../sources/apiResource'
import { queryStakingApi } from '../sources/stakingApi'
import type { ResourceDefinition } from '../types'
import { identities } from './identities'
import {
	validatorEntries,
	validatorOverviews,
	validatorStats,
} from './validators'

const shuffled = <T>(items: T[]): T[] => {
	const result = [...items]
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

const nodeCandidates = (): ResourceDefinition<{
	active: Validator[]
	waiting: Validator[]
	highPerformance: Validator[]
}> => ({
	name: 'validatorEntries',
	key: ['candidates'],
	staleTimeMs: 60_000,
	requires: ['era'],
	load: async (context) => {
		const [entries, overviews] = await Promise.all([
			context.request(validatorEntries()),
			context.request(validatorOverviews()),
		])
		const identityData =
			context.policy.sources.identities === 'disabled'
				? undefined
				: await context.request(
						identities(entries.map(({ address }) => address)),
					)
		const eligible = entries.filter(
			({ address, prefs }) =>
				!prefs?.blocked &&
				(!identityData ||
					identityData.identities[address] ||
					identityData.supers[address]),
		)
		const activeSet = new Set(overviews.map(({ address }) => address))
		let ranks: string[]
		if (context.policy.sources.validatorStats === 'staking-api') {
			ranks = [
				...(await context.request(validatorStats())).activeValidatorRanks,
			]
				.sort((a, b) => a.rank - b.rank)
				.map(({ validator }) => validator)
		} else {
			const points = await context.node.query.erasRewardPoints(context.era)
			if (!points)
				throw new Error('Current era reward points are not available')
			ranks = [...points.individual]
				.sort((a, b) => b[1] - a[1])
				.map(([who]) => who.address(context.ss58))
		}
		const high = new Set(ranks.slice(0, Math.floor(ranks.length / 2)))
		const active = eligible.filter(({ address }) => activeSet.has(address))
		return {
			active,
			waiting: eligible.filter(({ address }) => !activeSet.has(address)),
			highPerformance: active.filter(({ address }) => high.has(address)),
		}
	},
})

export const optimalValidators =
	(): ResourceDefinition<OptimalValidatorBatchData> => ({
		name: 'optimalValidators',
		key: [],
		load: async (context) => {
			let candidates: Validator[]
			if (context.policy.sources.optimalValidators === 'staking-api') {
				candidates = (
					await queryStakingApi<OptimalValidatorBatchData>(
						OPTIMAL_VALIDATOR_BATCH_QUERY,
						{ network: context.network },
						context.signal,
					)
				).fetchOptimalValidatorBatch
			} else {
				const { waiting, highPerformance } = await context.request(
					nodeCandidates(),
				)
				candidates = [
					...shuffled(waiting).slice(0, 2),
					...shuffled(highPerformance).slice(0, 14),
				]
			}
			candidates = shuffled(candidates).slice(0, 16)
			if (
				candidates.length &&
				context.policy.sources.validatorSearch === 'staking-api'
			) {
				candidates = (
					await queryStakingApi<SanitizeNomineeCandidatesData>(
						SANITIZE_NOMINEE_CANDIDATES_QUERY,
						{ network: context.network, candidates },
						context.signal,
					)
				).sanitizeNomineeCandidates
			}
			return { fetchOptimalValidatorBatch: candidates }
		},
	})

export const validatorCandidate = (
	strategy: ValidatorCandidateStrategy,
	excludeAddresses: string[],
): ResourceDefinition<Validator | null> => ({
	name: 'validatorCandidates',
	key: [strategy, [...excludeAddresses].sort()],
	load: async (context) => {
		if (context.policy.sources.validatorCandidates === 'staking-api') {
			const result = await queryStakingApi<
				Record<string, ValidatorCandidate | null>
			>(
				getValidatorCandidateQuery(1),
				{ network: context.network, strategy0: strategy, excludeAddresses },
				context.signal,
			)
			return result.candidate0 ?? null
		}
		if (strategy !== 'ACTIVE')
			throw new Error('This candidate strategy requires retainment support')
		const { highPerformance } = await context.request(nodeCandidates())
		return (
			shuffled(
				highPerformance.filter(
					({ address }) => !excludeAddresses.includes(address),
				),
			)[0] ?? null
		)
	},
})
export const sanitizeCandidates = (candidates: SanitizeNomineeCandidate[]) =>
	apiResource<SanitizeNomineeCandidatesData>(
		'validatorSearch',
		'sanitize',
		SANITIZE_NOMINEE_CANDIDATES_QUERY,
		{ candidates },
		candidates.length > 0,
	)
export const searchValidators = (searchTerm: string) =>
	apiResource<SearchValidatorsData>(
		'validatorSearch',
		'search',
		SEARCH_VALIDATORS_QUERY,
		{ searchTerm },
		searchTerm.length > 0,
	)
