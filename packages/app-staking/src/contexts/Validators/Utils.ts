// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	LocalValidatorEntriesData,
	ValidatorActivityTier,
} from 'contexts/Validators/types'
import type { NetworkId, Validator } from 'types'

const BELOW_BASELINE_ACTIVITY_CUTOFF = 0.9

export const getActivityTier = (
	rank: number | null | undefined,
	total: number,
): ValidatorActivityTier | undefined => {
	if (!Number.isInteger(total) || total < 1) {
		return undefined
	}

	if (rank === null || rank === undefined) {
		return 'notRated'
	}

	if (!Number.isInteger(rank) || rank < 1 || rank > total) {
		return undefined
	}

	return rank / total > BELOW_BASELINE_ACTIVITY_CUTOFF
		? 'belowBaseline'
		: 'good'
}

// Get favorite validators from local storage
export const getLocalFavorites = (network: NetworkId) => {
	const localFavorites = localStorage.getItem(`${network}_favorites`)
	return localFavorites !== null ? (JSON.parse(localFavorites) as string[]) : []
}

// Get local validator entries data for an era
export const getLocalEraValidators = (network: NetworkId, era: string) => {
	const data = localStorage.getItem(`${network}_validators`)
	const current = data ? (JSON.parse(data) as LocalValidatorEntriesData) : null
	const currentEra = current?.era

	if (currentEra && currentEra !== era) {
		localStorage.removeItem(`${network}_validators`)
	}

	return currentEra === era ? current : null
}

// Set local validator entries data for an era
export const setLocalEraValidators = (
	network: NetworkId,
	era: string,
	entries: Validator[],
) => {
	localStorage.setItem(
		`${network}_validators`,
		JSON.stringify({
			era,
			entries,
		}),
	)
}
