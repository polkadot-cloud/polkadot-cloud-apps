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
	fetchRandomValidatorCandidate,
	fetchSanitizeNomineeCandidates,
	fetchValidatorCandidateBatch,
} from 'plugin-staking-api'
import type { ValidatorCandidateStrategy } from 'plugin-staking-api/types'
import type { Validator } from 'types'

// Helper function to get a random item from an array
const getRandomItem = <T,>(items: T[]): T | null => shuffle(items)[0] || null

const OPTIMAL_CANDIDATE_STRATEGIES = [
	...Array.from({ length: 4 }, () => 'ACTIVE' as const),
	...Array.from({ length: 6 }, () => 'HIGH_RETAINER' as const),
	...Array.from({ length: 6 }, () => 'HIGH_COMPOUNDER' as const),
] satisfies ValidatorCandidateStrategy[]

export const useFetchMethods = () => {
	const { network } = useNetwork()
	const { applyFilter } = useValidatorFilters()
	const { favoritesList } = useFavoriteValidators()
	const { getValidators, getValidatorRankSegment } = useValidators()

	const fetch = async (method: string): Promise<Validator[]> => {
		switch (method) {
			case 'Optimal Selection':
				return await fetchOptimal()
			case 'From Favorites':
				return fetchFavorites()
			default:
				return []
		}
	}

	const add = async (nominations: Validator[], type: AddNominationsType) => {
		switch (type) {
			case 'High Performance Validator':
				nominations = await addHighPerformanceValidator(nominations)
				break
			case 'Active Validator':
				nominations = addActiveValidator(nominations)
				break
			case 'Random Validator':
				nominations = addRandomValidator(nominations)
				break
			default:
				return nominations
		}
		return nominations
	}

	const fetchFavorites = () => {
		let favs: Validator[] = []

		if (!favoritesList) {
			return favs
		}

		if (favoritesList?.length) {
			// take subset of up to 16 favorites
			favs = favoritesList.slice(0, 16)
		}
		return favs
	}

	const fetchCurrentOptimal = () => {
		let active = [...getValidators()]
		let waiting = [...getValidators()]

		// filter validators to find waiting candidates
		waiting = applyFilter(
			null,
			['blocked_nominations', 'missing_identity', 'in_session'],
			waiting,
		)

		// filter validators to find active candidates
		active = applyFilter(
			['active'],
			['blocked_nominations', 'missing_identity'],
			active,
		)

		// keep validators that are in upper 50% performance quartile.
		active = active.filter((a: Validator) => {
			const quartile = getValidatorRankSegment(a.address)
			return quartile <= 50
		})

		// choose shuffled subset of waiting
		if (waiting.length) {
			waiting = shuffle(waiting).slice(0, 2)
		}
		// choose shuffled subset of active
		if (active.length) {
			active = shuffle(active).slice(0, 14)
		}

		return shuffle(waiting.concat(active))
	}

	const fetchStakingApiOptimal = async () => {
		const nominations: Validator[] = []
		const addresses = new Set<string>()
		let pendingStrategies = [...OPTIMAL_CANDIDATE_STRATEGIES]

		while (pendingStrategies.length) {
			const results = await fetchValidatorCandidateBatch({
				network,
				strategies: pendingStrategies,
				excludeAddresses: [...addresses],
			})
			const retryStrategies: ValidatorCandidateStrategy[] = []

			for (const { strategy, candidate } of results) {
				if (!candidate || addresses.has(candidate.address)) {
					retryStrategies.push(strategy)
					continue
				}

				addresses.add(candidate.address)
				nominations.push(candidate)
			}

			if (retryStrategies.length === pendingStrategies.length) {
				break
			}
			pendingStrategies = retryStrategies
		}

		return nominations
	}

	const fetchOptimal = async () => {
		const stakingApiEnabled = pluginEnabled('staking_api')
		const useStakingApiCandidates =
			stakingApiEnabled &&
			StakingApiRetainmentSupportedNetworks.includes(network)
		const nominations = useStakingApiCandidates
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
		const { randomValidatorCandidate } = await fetchRandomValidatorCandidate({
			network,
			strategy,
			excludeAddresses: nominations.map(({ address }) => address),
		})

		return randomValidatorCandidate
	}

	const available = (nominations: Validator[]) => {
		const all = [...getValidators()]

		const parachainActive =
			applyFilter(
				['active'],
				['blocked_nominations', 'missing_identity'],
				all,
			).filter(
				(n: Validator) => !nominations.find((o) => o.address === n.address),
			) || []

		const active =
			applyFilter(
				['active'],
				['blocked_nominations', 'missing_identity'],
				all,
			).filter(
				(n: Validator) => !nominations.find((o) => o.address === n.address),
			) || []

		const highPerformance = active.filter((a: Validator) => {
			const quartile = getValidatorRankSegment(a.address)
			return quartile <= 50
		})

		const random =
			applyFilter(
				null,
				['blocked_nominations', 'missing_identity'],
				all,
			).filter(
				(n: Validator) => !nominations.find((o) => o.address === n.address),
			) || []

		return {
			parachainValidators: parachainActive,
			highPerformance,
			activeValidators: active,
			randomValidators: random,
		}
	}

	const addActiveValidator = (nominations: Validator[]) => {
		const all: Validator[] = available(nominations).activeValidators

		// take one validator
		const validator = getRandomItem(all)
		if (validator) {
			nominations.push(validator)
		}
		return nominations
	}

	const addHighPerformanceValidator = async (nominations: Validator[]) => {
		if (
			pluginEnabled('staking_api') &&
			StakingApiRetainmentSupportedNetworks.includes(network)
		) {
			const validator = await fetchCandidate(nominations, 'ACTIVE')
			if (validator) {
				nominations.push(validator)
			}
			return nominations
		}

		const all: Validator[] = available(nominations).highPerformance

		// take one validator
		const validator = getRandomItem(all)
		if (validator) {
			nominations.push(validator)
		}
		return nominations
	}

	const addRandomValidator = (nominations: Validator[]) => {
		const all: Validator[] = available(nominations).randomValidators

		// take one validator
		const validator = getRandomItem(all)
		if (validator) {
			nominations.push(validator)
		}
		return nominations
	}

	return {
		fetch,
		fetchCandidate,
		add,
		available,
	}
}
