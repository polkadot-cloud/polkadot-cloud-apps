// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { shuffle } from '@w3ux/utils'
import { StakingApiRetainmentSupportedNetworks } from 'consts/plugins'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { pluginEnabled } from 'global-bus'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { useNetwork } from 'hooks/useNetwork'
import { useValidatorFilters } from 'hooks/useValidatorFilters'
import type { AddNominationsType } from 'library/GenerateNominations/types'
import {
	fetchOptimalValidatorBatch,
	fetchSanitizeNomineeCandidates,
	fetchValidatorCandidateBatch,
} from 'plugin-staking-api'
import type { ValidatorCandidateStrategy } from 'plugin-staking-api/types'
import type { Validator } from 'types'

// Helper function to get a random item from an array
const getRandomItem = <T,>(items: T[]): T | null => shuffle(items)[0] || null
const MAX_OPTIMAL_VALIDATORS = 16

export const useFetchMethods = () => {
	const { network } = useNetwork()
	const { applyFilter } = useValidatorFilters()
	const { favoritesList } = useFavoriteValidators()
	const { getValidators, isValidatorHighPerformance } = useValidators()
	const stakingApiEnabled = pluginEnabled('staking_api')
	const stakingApiCandidatesEnabled =
		stakingApiEnabled && StakingApiRetainmentSupportedNetworks.includes(network)

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

	const fetchCurrentOptimal = () => {
		const validators = getValidators()
		const waiting: Validator[] = applyFilter(
			null,
			['blocked_nominations', 'missing_identity', 'in_session'],
			validators,
		)
		const active: Validator[] = applyFilter(
			['active'],
			['blocked_nominations', 'missing_identity'],
			validators,
		).filter(({ address }: Validator) => isValidatorHighPerformance(address))

		return shuffle([
			...shuffle(waiting).slice(0, 2),
			...shuffle(active).slice(0, 14),
		])
	}

	const fetchStakingApiOptimal = async () => {
		const { fetchOptimalValidatorBatch: candidates } =
			await fetchOptimalValidatorBatch({ network })

		return shuffle([...candidates]).slice(0, MAX_OPTIMAL_VALIDATORS)
	}

	const fetchOptimal = async () => {
		const nominations = stakingApiCandidatesEnabled
			? await fetchStakingApiOptimal()
			: fetchCurrentOptimal()

		if (!stakingApiEnabled) {
			return nominations
		}

		const { sanitizeNomineeCandidates } = await fetchSanitizeNomineeCandidates(
			network,
			nominations,
		)

		return sanitizeNomineeCandidates
	}

	const fetchCandidate = async (
		nominations: Validator[],
		strategy: ValidatorCandidateStrategy,
	): Promise<Validator | null> => {
		const [result] = await fetchValidatorCandidateBatch({
			network,
			strategies: [strategy],
			excludeAddresses: nominations.map(({ address }) => address),
		})

		return result?.candidate ?? null
	}

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
		if (stakingApiCandidatesEnabled) {
			const validator = await fetchCandidate(nominations, 'ACTIVE')
			return validator ? [...nominations, validator] : nominations
		}

		return appendRandomCandidate(
			nominations,
			available(nominations).highPerformance,
		)
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
