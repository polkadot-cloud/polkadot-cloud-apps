// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { queryOptions, skipToken } from '@tanstack/react-query'
import { getNetwork, pluginEnabled } from 'global-bus'
import type { DataPointConfig } from './types'

export const dataPointOptions = <T>({
	queryKey,
	node,
	stakingApi,
}: DataPointConfig<T>) => {
	// Capture the network and selected source for the lifetime of this request.
	const network = getNetwork()
	const stakingApiEnabled = pluginEnabled('staking_api')
	const source = stakingApiEnabled ? stakingApi : node
	const queryFn = source.enabled === false ? skipToken : source.queryFn

	return queryOptions({
		// Every data point's key is scoped to its network and source.
		queryKey: [
			...queryKey,
			network,
			stakingApiEnabled ? 'staking-api' : 'node',
		],
		queryFn:
			queryFn === skipToken
				? skipToken
				: ({ signal }) => queryFn({ network, signal }),
		enabled: queryFn !== skipToken,
		// Reuse cached results without age-based refetches.
		staleTime: Infinity,
		// Surface failures from the selected source without retries or fallback.
		retry: false,
	})
}
