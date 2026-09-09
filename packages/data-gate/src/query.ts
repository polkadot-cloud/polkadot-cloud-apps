// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { queryOptions, skipToken } from '@tanstack/react-query'
import { getNetwork, pluginEnabled } from 'global-bus'
import type { DataPointConfig } from './types'

export const dataPointOptions = <T>({
	key,
	node,
	stakingApi,
}: DataPointConfig<T>) => {
	// Capture the network for the lifetime of this request.
	const network = getNetwork()

	// Select the source and its cache-key label together based on plugin availability.
	const { source, sourceKey } = pluginEnabled('staking_api')
		? { source: stakingApi, sourceKey: 'staking-api' }
		: { source: node, sourceKey: 'node' }

	// Determine the query function to use based on the selected source.
	const queryFn = source.enabled === false ? skipToken : source.queryFn

	// Every data point's key is scoped to its network and source.
	const queryKey = [...key, network, sourceKey]

	return queryOptions({
		queryKey,
		queryFn:
			queryFn === skipToken
				? skipToken
				: ({ signal }) => queryFn({ network, signal }),
		enabled: queryFn !== skipToken,
		staleTime: Infinity,
		retry: false,
	})
}
