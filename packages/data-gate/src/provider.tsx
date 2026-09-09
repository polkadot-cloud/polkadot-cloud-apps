// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getNetwork, pluginEnabled, plugins$ } from 'global-bus'
import {
	createContext,
	type ReactNode,
	useContext,
	useState,
	useSyncExternalStore,
} from 'react'
import type { ServiceInterface } from 'types'

export interface DataGateConfig {
	node: ServiceInterface
	ready: boolean
	era: number
}

const DataGateContext = createContext<DataGateConfig | null>(null)

const getSource = () => `${getNetwork()}:${pluginEnabled('staking_api')}`

// Plugin notifications include network changes, so one subscription covers both.
const subscribeSource = (onChange: () => void) => {
	const subscription = plugins$.subscribe(onChange)
	return () => subscription.unsubscribe()
}

export const DataGateProvider = ({
	children,
	...config
}: DataGateConfig & { children: ReactNode }) => {
	const [client] = useState(() => new QueryClient())

	return (
		<DataGateContext.Provider value={config}>
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		</DataGateContext.Provider>
	)
}

export const useDataGate = () => {
	// Every data point updates when the global network or API preference changes.
	useSyncExternalStore(subscribeSource, getSource, getSource)
	const config = useContext(DataGateContext)
	if (!config) {
		throw new Error('Data gate hooks require a DataGateProvider')
	}
	return config
}
