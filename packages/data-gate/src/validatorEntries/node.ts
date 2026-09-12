// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	queryOptions,
	skipToken,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { PerbillMultiplier } from 'consts'
import { getNetwork, pluginEnabled } from 'global-bus'
import type { NetworkId, ServiceInterface, Validator } from 'types'
import { useDataGate } from '../provider'

export const nodeValidatorEntriesOptions = (
	node: ServiceInterface,
	network: NetworkId,
	era: number,
	enabled: boolean,
) =>
	queryOptions({
		queryKey: ['validator-entries', network, 'node', era],
		queryFn:
			enabled && !pluginEnabled('staking_api')
				? async ({ signal }): Promise<Validator[]> => {
						signal.throwIfAborted()
						// Guard imperative fetches as well as mounted consumers when the source changes.
						if (pluginEnabled('staking_api'))
							throw new Error('Node validator entries are disabled in API mode')
						const entries = await node.query.validatorEntries()
						signal.throwIfAborted()
						return entries.map(([address, prefs]) => ({
							address,
							prefs: {
								commission: Number(
									(prefs.commission / PerbillMultiplier).toFixed(2),
								),
								blocked: prefs.blocked,
							},
						}))
					}
				: skipToken,
		staleTime: Infinity,
		gcTime: Infinity,
		retry: false,
	})

export const useNodeValidatorEntries = (enabled = false) => {
	const { node, era, ready } = useDataGate()
	const client = useQueryClient()
	const allowed = enabled && ready && era > 0 && !pluginEnabled('staking_api')
	const options = nodeValidatorEntriesOptions(node, getNetwork(), era, allowed)
	const query = useQuery(options)
	return {
		...query,
		data: allowed ? query.data : undefined,
		fetchEntries: () => client.fetchQuery(options),
	}
}
