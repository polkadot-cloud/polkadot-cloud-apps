// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { pluginEnabled } from 'global-bus'
import type { Exposure } from 'types'
import { useDataGate } from '../provider'
import type { DataPointConfig, DataSourceContext } from '../types'
import { useDataPoint } from '../useDataPoint'
import { useNodeEraStakers } from './node'

// Active-era staking information derived from validator exposures: which nominators back each
// validator and how much stake they contribute. Individual queries use this to determine nominator
// counts, nominee statuses and whether a stash has active backing.
export const useEraStakersQuery = <T>({
	key,
	node,
	stakingApi,
	enabled = true,
}: {
	key: DataPointConfig<T>['key']
	node: (exposures: Exposure[]) => T
	stakingApi: (context: DataSourceContext, era: number) => Promise<T>
	enabled?: boolean
}) => {
	const { era, ready } = useDataGate()
	const api = pluginEnabled('staking_api')
	const snapshot = useNodeEraStakers(true, enabled && !api)
	const result = useDataPoint({
		key: ['era-stakers', era, ...key],
		node: {
			enabled: enabled && ready && era > 0,
			// Keep this query runnable after a prerequisite fails so public refetch retries it.
			queryFn: async ({ signal }) => {
				const exposures = await snapshot.fetchExposures()
				signal.throwIfAborted()
				return node(exposures)
			},
		},
		stakingApi: {
			enabled: enabled && era > 0,
			// Indexed data can change within the era as the API catches up.
			refreshInterval: 60_000,
			queryFn: (context) => stakingApi(context, era),
		},
	})
	const error =
		!api && enabled ? (snapshot.error ?? result.error) : result.error
	return { ...result, error, loading: enabled && !error && result.loading }
}
