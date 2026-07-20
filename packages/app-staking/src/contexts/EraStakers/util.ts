// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	Exposure,
	LocalExposure,
	LocalExposuresData,
	NetworkId,
} from 'types'

// Get local `erasStakers` entries for an era
export const getLocalEraExposures = (
	network: NetworkId,
	era: string,
	activeEra: string,
) => {
	const data = localStorage.getItem(`${network}_exposures`)
	let current: LocalExposuresData | null = null
	try {
		current = data ? (JSON.parse(data) as LocalExposuresData) : null
	} catch {
		// Corrupt local data; clear it and treat as missing
		localStorage.removeItem(`${network}_exposures`)
	}
	const currentEra = current?.era

	if (currentEra && currentEra !== activeEra) {
		localStorage.removeItem(`${network}_exposures`)
	}
	if (currentEra === era && current?.exposures) {
		return maxifyExposures(current.exposures) as Exposure[]
	}

	return null
}

// Set local stakers entries data for an era
export const setLocalEraExposures = (
	network: NetworkId,
	era: string,
	exposures: Exposure[],
) => {
	localStorage.setItem(
		`${network}_exposures`,
		JSON.stringify({
			era,
			exposures: minifyExposures(exposures),
		}),
	)
}

// Minify exposures data structure for local storage
const minifyExposures = (exposures: Exposure[]) =>
	exposures.map(({ keys, val: { others, own, total } }) => ({
		k: [keys[0], keys[1]],
		v: {
			o: others.map(({ who, value }) => [who, value]),
			w: own,
			t: total,
		},
	}))

// Expand local exposure data into JSON format
const maxifyExposures = (exposures: LocalExposure[]) =>
	exposures.map(({ k, v }) => ({
		keys: [k[0], k[1]],
		val: {
			others: v.o.map(([who, value]) => ({
				who,
				value,
			})),
			own: v.w,
			total: v.t,
		},
	}))
