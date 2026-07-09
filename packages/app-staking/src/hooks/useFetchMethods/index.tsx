// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { shuffle } from '@w3ux/utils'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { useValidatorFilters } from 'hooks/useValidatorFilters'
import type { AddNominationsType } from 'library/GenerateNominations/types'
import type { Validator } from 'types'

// Helper function to get a random item from an array
const getRandomItem = <T,>(items: T[]): T | null => shuffle(items)[0] || null

export const useFetchMethods = () => {
	const { applyFilter } = useValidatorFilters()
	const { favoritesList } = useFavoriteValidators()
	const { getValidators, getValidatorRankSegment } = useValidators()

	const fetch = (method: string) => {
		let nominations
		switch (method) {
			case 'Optimal Selection':
				nominations = fetchOptimal()
				break
			case 'From Favorites':
				nominations = fetchFavorites()
				break
			default:
				return []
		}
		return nominations
	}

	const add = (nominations: Validator[], type: AddNominationsType) => {
		switch (type) {
			case 'High Performance Validator':
				nominations = addHighPerformanceValidator(nominations)
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

	const fetchOptimal = () => {
		let active = [...getValidators()]
		let waiting = [...getValidators()]

		// filter validators to find waiting candidates
		waiting = applyFilter(
			null,
			[
				'blocked_nominations',
				'missing_identity',
				'in_session',
			],
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

	const addHighPerformanceValidator = (nominations: Validator[]) => {
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
		add,
		available,
	}
}
