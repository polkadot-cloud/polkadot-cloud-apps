// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useQueryClient } from '@tanstack/react-query'
import { getNetwork } from 'global-bus'
import { fetchEraActiveValidatorCount } from 'plugin-staking-api'
import { requestOptions } from '../eraStakers/requestOptions'
import { useDataGate } from '../provider'
import { useDataPoint } from '../useDataPoint'
import { nodeValidatorOverviewsOptions } from './node'

// Statistics need an aggregate, never a download of every API overview.
export const useActiveValidatorCount = () => {
	const client = useQueryClient()
	const { node, era, ready } = useDataGate()
	const network = getNetwork()
	return useDataPoint<number>({
		key: ['active-validator-count', era],
		node: {
			enabled: ready && era > 0,
			queryFn: async ({ signal }) => {
				const overviews = await client.fetchQuery(
					nodeValidatorOverviewsOptions(node, network, era),
				)
				signal.throwIfAborted()
				return overviews.length
			},
		},
		stakingApi: {
			enabled: era > 0,
			refreshInterval: 60_000,
			queryFn: async ({ network, signal }) => {
				const { eraActiveValidatorCount: count } =
					await fetchEraActiveValidatorCount(
						network,
						era,
						requestOptions(signal),
					)
				signal.throwIfAborted()
				if (!Number.isSafeInteger(count) || count < 0)
					throw new Error('Staking API returned invalid validator count')
				return count
			},
		},
	})
}
