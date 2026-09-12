// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { pluginEnabled } from 'global-bus'
import type { IdentityOf, SuperIdentity } from 'types'
import { formatIdentities, formatSuperIdentities } from 'utils'
import { useDataGate } from '../provider'
import { useDataPoint } from '../useDataPoint'
import { validatorRecordsApiSource, validatorRecordsKey } from './api'
import { useNodeValidatorEntries } from './node'

export interface ValidatorRecords {
	prefs: Record<string, { commission: number; blocked: boolean } | null>
	identities: Record<string, IdentityOf>
	supers: Record<string, SuperIdentity>
}

// Node consumers share the raw scan. API consumers fetch only their requested addresses.
export const useValidatorRecords = (
	addresses: string[],
	allNodeEntries = false,
) => {
	const { node, era, ready } = useDataGate()
	const api = pluginEnabled('staking_api')
	const targets = [...new Set(addresses)].sort()
	const enabled = targets.length > 0 || (!api && allNodeEntries)
	const snapshot = useNodeValidatorEntries(enabled && !api)
	// A full node snapshot already includes its list items. Mounting those items must not replace the
	// query (and its loading state) with another identical full-list request.
	const entriesByAddress = new Set(snapshot.data?.map(({ address }) => address))
	const requestedKey =
		!api && allNodeEntries
			? targets.filter((address) => !entriesByAddress.has(address))
			: targets
	const result = useDataPoint<ValidatorRecords>({
		key: validatorRecordsKey(era, requestedKey, !api && allNodeEntries),
		node: {
			enabled: enabled && ready && era > 0,
			queryFn: async ({ signal }) => {
				const entries = await snapshot.fetchEntries()
				signal.throwIfAborted()
				const requested = allNodeEntries
					? [...new Set([...targets, ...entries.map(({ address }) => address)])]
					: targets
				const [identities, supers] = await Promise.all([
					node.query.identityOfMulti(requested),
					node.query.superOfMulti(requested),
				])
				signal.throwIfAborted()
				const byAddress = new Map(
					entries.map((entry) => [entry.address, entry.prefs]),
				)
				return {
					prefs: Object.fromEntries(
						requested.map((address) => [
							address,
							byAddress.get(address) ?? null,
						]),
					),
					identities: formatIdentities(requested, identities),
					supers: formatSuperIdentities(supers),
				}
			},
		},
		stakingApi: validatorRecordsApiSource(targets),
	})
	return {
		...result,
		loading: enabled && result.loading,
		entries: !api ? snapshot.data : undefined,
	}
}
