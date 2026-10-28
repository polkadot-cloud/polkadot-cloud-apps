// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { pluginEnabled } from 'global-bus'
import { perbillToPercent } from 'utils'
import { useDataGate } from '../provider'
import { useDataPoint } from '../useDataPoint'
import type { ValidatorRecords } from '../validatorEntries'
import {
	validatorRecordsApiSource,
	validatorRecordsKey,
} from '../validatorEntries/api'

const selectPrefs = ({ prefs }: Pick<ValidatorRecords, 'prefs'>) => prefs

// Fetch preferences for a known set of addresses without loading validator entries.
export const useValidatorPrefs = (addresses: string[]) => {
	const { node, ready, era } = useDataGate()
	const targets = [...new Set(addresses)].sort()
	const enabled = targets.length > 0
	const result = useDataPoint(
		{
			key: pluginEnabled('staking_api')
				? validatorRecordsKey(era, targets)
				: ['validator-prefs', era, targets],
			node: {
				enabled: enabled && ready,
				queryFn: async ({ signal }) => {
					signal.throwIfAborted()
					const prefs = await node.query.validatorsMulti(targets)
					signal.throwIfAborted()
					return {
						prefs: Object.fromEntries(
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
						),
					}
				},
			},
			stakingApi: validatorRecordsApiSource(targets),
		},
		selectPrefs,
	)
	return { ...result, loading: enabled && result.loading }
}
