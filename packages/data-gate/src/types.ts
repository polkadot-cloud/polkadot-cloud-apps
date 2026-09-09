// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryKey, SkipToken } from '@tanstack/react-query'
import type { NetworkId, ServiceInterface } from 'types'

export interface DataPointOptions {
	// Additional result dependencies share the query's caching and cancellation lifecycle.
	dependencies?: QueryKey
}

// Shared context for data points to configure source queries and determine whether their
// prerequisites are met.
export interface DataGateState {
	node: ServiceInterface
	ready: boolean
	era: number
}

export interface DataPointSource<T> {
	// Source prerequisites are optional; missing input can use skipToken.
	enabled?: boolean
	queryFn:
		| ((context: { network: NetworkId; signal: AbortSignal }) => Promise<T>)
		| SkipToken
}

export interface DataPointConfig<T> {
	key: QueryKey
	node: DataPointSource<T>
	stakingApi: DataPointSource<T>
}
