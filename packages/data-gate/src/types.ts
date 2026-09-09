// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryKey, SkipToken } from '@tanstack/react-query'
import type { NetworkId } from 'types'

export interface DataPointSource<T> {
	// Source prerequisites are optional; missing input can use skipToken.
	enabled?: boolean
	queryFn:
		| ((context: { network: NetworkId; signal: AbortSignal }) => Promise<T>)
		| SkipToken
}

export interface DataPointConfig<T> {
	queryKey: QueryKey
	node: DataPointSource<T>
	stakingApi: DataPointSource<T>
}
