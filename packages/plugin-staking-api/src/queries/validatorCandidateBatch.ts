// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import type {
	ValidatorCandidateBatchData,
	ValidatorCandidateBatchResult,
	ValidatorCandidateBatchVariables,
} from '../types'
import { fetchQuery } from './generic'

const QUERY_CACHE = new Map<number, DocumentNode>()

const getQuery = (batchSize: number) => {
	const cached = QUERY_CACHE.get(batchSize)
	if (cached) {
		return cached
	}

	const strategyVariables = Array.from(
		{ length: batchSize },
		(_, index) => `$strategy${index}: ValidatorCandidateStrategy!`,
	).join('\n')
	const candidateFields = Array.from(
		{ length: batchSize },
		(_, index) => `
		candidate${index}: randomValidatorCandidate(
			network: $network
			strategy: $strategy${index}
			active: $active
			excludeAddresses: $excludeAddresses
			topPercent: $topPercent
		) {
			address
			prefs {
				commission
				blocked
			}
		}`,
	).join('\n')

	const query = gql(`
		query ValidatorCandidateBatch(
			$network: String!
			$active: Boolean = true
			$excludeAddresses: [String!] = []
			$topPercent: Int = 50
			${strategyVariables}
		) {
			${candidateFields}
		}
	`)
	QUERY_CACHE.set(batchSize, query)

	return query
}

export const fetchValidatorCandidateBatch = async ({
	strategies,
	...variables
}: ValidatorCandidateBatchVariables): Promise<
	ValidatorCandidateBatchResult[]
> => {
	if (!strategies.length) {
		return []
	}

	const strategyVariables = Object.fromEntries(
		strategies.map((strategy, index) => [`strategy${index}`, strategy]),
	)
	const data = await fetchQuery<ValidatorCandidateBatchData>(
		getQuery(strategies.length),
		{ ...variables, ...strategyVariables },
		{},
		{ fetchPolicy: 'no-cache' },
	)

	return strategies.map((strategy, index) => ({
		strategy,
		candidate: data[`candidate${index}`] ?? null,
	}))
}
