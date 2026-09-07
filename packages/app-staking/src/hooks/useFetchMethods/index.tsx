// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { shuffle } from '@w3ux/utils'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useDataGate } from 'data-gate/react'
import {
	optimalValidators,
	validatorCandidate,
} from 'data-gate/resources/candidates'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { useValidatorFilters } from 'hooks/useValidatorFilters'
import type { AddNominationsType } from 'library/GenerateNominations/types'
import type { ValidatorCandidateStrategy } from 'plugin-staking-api/types'
import type { Validator } from 'types'

// Helper function to get a random item from an array
const getRandomItem = <T,>(items: T[]): T | null => shuffle(items)[0] || null

export const useFetchMethods = () => {
	const gate = useDataGate()
	const { applyFilter } = useValidatorFilters()
	const { favoritesList } = useFavoriteValidators()
	const { getValidators, isValidatorHighPerformance } = useValidators()

	const fetch = async (method: string): Promise<Validator[]> => {
		switch (method) {
			case 'Optimal Selection':
				return fetchOptimal()
			case 'From Favorites':
				return fetchFavorites()
			default:
				return []
		}
	}

	const add = async (nominations: Validator[], type: AddNominationsType) => {
		switch (type) {
			case 'High Performance Validator':
				return addHighPerformanceValidator(nominations)
			case 'Active Validator':
				return addActiveValidator(nominations)
			case 'Random Validator':
				return addRandomValidator(nominations)
			default:
				return nominations
		}
	}

	const fetchFavorites = () => favoritesList?.slice(0, 16) ?? []

	const fetchOptimal = async () =>
		(await gate.request(optimalValidators(), { refresh: true }))
			.fetchOptimalValidatorBatch
	const fetchCandidate = (
		nominations: Validator[],
		strategy: ValidatorCandidateStrategy,
	) =>
		gate.request(
			validatorCandidate(
				strategy,
				nominations.map(({ address }) => address),
			),
			{ refresh: true },
		)

	const available = (nominations: Validator[]) => {
		const nominated = new Set(nominations.map(({ address }) => address))
		const candidates = (includes: string[] | null) =>
			applyFilter(
				includes,
				['blocked_nominations', 'missing_identity'],
				getValidators(),
			).filter(({ address }: Validator) => !nominated.has(address))
		const active: Validator[] = candidates(['active'])

		return {
			highPerformance: active.filter(({ address }) =>
				isValidatorHighPerformance(address),
			),
			activeValidators: active,
			randomValidators: candidates(null),
		}
	}

	const appendRandomCandidate = (
		nominations: Validator[],
		candidates: Validator[],
	) => {
		const candidate = getRandomItem(candidates)
		return candidate ? [...nominations, candidate] : nominations
	}

	const addActiveValidator = (nominations: Validator[]) =>
		appendRandomCandidate(nominations, available(nominations).activeValidators)

	const addHighPerformanceValidator = async (nominations: Validator[]) => {
		const validator = await fetchCandidate(nominations, 'ACTIVE')
		return validator ? [...nominations, validator] : nominations
	}

	const addRandomValidator = (nominations: Validator[]) =>
		appendRandomCandidate(nominations, available(nominations).randomValidators)

	return {
		fetch,
		fetchCandidate,
		add,
		available,
	}
}
