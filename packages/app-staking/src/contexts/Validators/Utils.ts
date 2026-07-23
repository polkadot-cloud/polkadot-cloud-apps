// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LocalValidatorEntriesData } from 'contexts/Validators/types'
import type { NetworkId, Validator } from 'types'

// Get favorite validators from local storage
export const getLocalFavorites = (network: NetworkId) => {
	const localFavorites = localStorage.getItem(`${network}_favorites`)
	if (localFavorites === null) {
		return []
	}
	try {
		return JSON.parse(localFavorites) as string[]
	} catch {
		// Corrupt local data; treat as no favorites
		return []
	}
}

// Get local validator entries data for an era
export const getLocalEraValidators = (network: NetworkId, era: string) => {
	const data = localStorage.getItem(`${network}_validators`)
	let current: LocalValidatorEntriesData | null = null
	try {
		current = data ? (JSON.parse(data) as LocalValidatorEntriesData) : null
	} catch {
		// Corrupt local data; clear it and treat as missing
		localStorage.removeItem(`${network}_validators`)
	}
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
