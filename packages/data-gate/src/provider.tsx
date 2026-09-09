// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createSafeContext } from '@w3ux/hooks'
import { type ReactNode, useState, useSyncExternalStore } from 'react'
import { createDataGateStore } from './state'
import type { DataGateState } from './types'

export const [DataGateContext, useDataGate] = createSafeContext<DataGateState>()

export const DataGateProvider = ({ children }: { children: ReactNode }) => {
	// Keep the query cache and bus-backed store stable across provider renders.
	const [client] = useState(() => new QueryClient())
	const [store] = useState(createDataGateStore)

	// Subscribe here so all data-gate consumers share the same bus snapshot.
	const state = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	)

	return (
		<DataGateContext.Provider value={state}>
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		</DataGateContext.Provider>
	)
}
