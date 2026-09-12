// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchValidatorRecords } from 'plugin-staking-api'
import type { ValidatorPrefs } from 'types'
import { perbillToPercent } from 'utils'
import { useDataGate } from '../provider'
import { useDataPoint } from '../useDataPoint'

// Fetch preferences for a known set of addresses without loading validator entries.
export const useValidatorPrefs = (addresses: string[]) => {
	const { node, ready, era } = useDataGate()
	const targets = [...new Set(addresses)].sort()
	const enabled = targets.length > 0
	const result = useDataPoint<Record<string, ValidatorPrefs | null>>({
		key: ['validator-prefs', era, targets],
		node: {
			enabled: enabled && ready,
			queryFn: async ({ signal }) => {
				signal.throwIfAborted()
				const prefs = await node.query.validatorsMulti(targets)
				signal.throwIfAborted()
				return Object.fromEntries(
					targets.map((address, index) => {
						const pref = prefs[index]
						return [
							address,
							pref
								? {
										commission: Number(
											perbillToPercent(pref.commission).toString(),
										),
										blocked: pref.blocked,
									}
								: null,
						]
					}),
				)
			},
		},
		stakingApi: {
			enabled,
			refreshInterval: 60_000,
			queryFn: async ({ network, signal }) => {
				const records = await fetchValidatorRecords(network, targets, signal)
				return Object.fromEntries(
					records.map(({ address, prefs }) => [address, prefs]),
				)
			},
		},
	})
	return { ...result, loading: enabled && result.loading }
}
