// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchValidatorRecords } from 'plugin-staking-api'
import {
	formatIdentitiesFromCache,
	formatSuperIdentitiesFromCache,
} from 'utils'
import type { DataPointSource } from '../types'
import type { ValidatorRecords } from '.'

// Both record and preference consumers observe this API query; select only changes their view.
export const validatorRecordsKey = (
	era: number,
	targets: string[],
	allNodeEntries = false,
) => ['validator-records', era, targets, allNodeEntries]

export const validatorRecordsApiSource = (
	targets: string[],
): DataPointSource<ValidatorRecords> => ({
	enabled: targets.length > 0,
	refreshInterval: 60_000,
	queryFn: async ({ network, signal }) => {
		const records = await fetchValidatorRecords(network, targets, signal)
		const identities = records.flatMap(({ address, identity }) =>
			identity ? [{ address, ...identity }] : [],
		)
		return {
			prefs: Object.fromEntries(
				records.map(({ address, prefs }) => [address, prefs]),
			),
			identities: formatIdentitiesFromCache(targets, identities),
			supers: formatSuperIdentitiesFromCache(identities),
		}
	},
})
