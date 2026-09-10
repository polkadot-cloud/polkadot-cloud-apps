// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	type QueryFunction,
	queryOptions,
	skipToken,
} from '@tanstack/react-query'
import { getNetwork, pluginEnabled } from 'global-bus'
import { hasSubscription, subscriptionQuery } from './subscription'
import type { DataPointConfig } from './types'

// Build options without starting I/O; TanStack Query runs the selected source.
export const dataPointOptions = <T>({
	key,
	node,
	stakingApi,
}: DataPointConfig<T>) => {
	// Capture the network for the lifetime of this request.
	const network = getNetwork()

	// Select the source and its cache-key label together based on plugin availability. A failed
	// request does not fall back to the other source.
	const { source, sourceKey } = pluginEnabled('staking_api')
		? { source: stakingApi, sourceKey: 'staking-api' }
		: { source: node, sourceKey: 'node' }

	const isSubscription = source.subscribe !== undefined

	// Disabled or skipped sources have no runnable query, including for manual refetch.
	let queryFn: QueryFunction<T> | typeof skipToken = skipToken
	if (source.enabled !== false) {
		const subscribe = source.subscribe
		const fetch = source.queryFn

		if (subscribe && subscribe !== skipToken) {
			// Adapt the first emission to a promise and later emissions to cache updates.
			queryFn = subscriptionQuery(subscribe, network)
		} else if (fetch && fetch !== skipToken) {
			queryFn = ({ signal }) => fetch({ network, signal })
		}
	}

	const enabled = queryFn !== skipToken

	// Keep caller inputs/dependencies, networks, and sources in separate cache entries.
	const queryKey = [
		...key,
		network,
		sourceKey,
		// Separate subscription mode and readiness. Losing readiness moves observers off the active
		// key; the adapter cleans up when its last observer leaves.
		...(isSubscription ? ['subscription', enabled] : []),
	]

	return queryOptions({
		queryKey,
		queryFn,
		enabled,
		// Share a live stream without refetching when another consumer mounts. Once it stops, mark its
		// snapshot stale so a new consumer reconnects. Fetches stay fresh until explicitly refreshed,
		// unless their source opts into a refresh cadence.
		staleTime: isSubscription
			? (query) => (hasSubscription(query) ? Infinity : 0)
			: (source.refreshInterval ?? Infinity),
		refetchInterval: source.refreshInterval ?? false,
		...(isSubscription && {
			// Live updates come from the source; these events should not restart it.
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		}),
		retry: false,
	})
}
