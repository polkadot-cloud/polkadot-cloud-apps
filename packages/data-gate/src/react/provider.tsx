// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from 'react'
import { createDataGate, type DataGate } from '../runtime/gate'
import type { DataGateConfig, ResourceDefinition } from '../types'

const Context = createContext<DataGate | null>(null)

export const DataGateProvider = ({
	children,
	...config
}: DataGateConfig & { children?: ReactNode }) => {
	const modulesKey = JSON.stringify([...config.modules].sort())
	const gate = useMemo(
		() => createDataGate(config),
		[
			config.network,
			config.apiEnabled,
			modulesKey,
			config.era,
			config.node,
			config.nodeReady,
			config.ss58,
			config.units,
			config.erasPerDay,
			config.requestTimeoutMs,
		],
	)
	useEffect(gate.mount, [gate])
	return <Context.Provider value={gate}>{children}</Context.Provider>
}

export const useDataGate = () => {
	const gate = useContext(Context)
	if (!gate) throw new Error('Data hooks require a DataGateProvider')
	return gate
}

export const useDataCapabilities = () => useDataGate().policy.capabilities

export const useDataResource = <T,>(definition: ResourceDefinition<T>) => {
	const resource = useDataGate().resource(definition)
	const snapshot = useSyncExternalStore(
		resource.subscribe,
		resource.getSnapshot,
		resource.getSnapshot,
	)
	return {
		...snapshot,
		loading:
			snapshot.data === undefined &&
			(snapshot.status === 'idle' ||
				snapshot.status === 'blocked' ||
				snapshot.status === 'loading'),
		refreshing: snapshot.status === 'loading' && snapshot.data !== undefined,
		refresh: resource.refresh,
	}
}

export const useDataDiagnostics = () => {
	const gate = useDataGate()
	return useSyncExternalStore(
		gate.subscribe,
		gate.getDiagnostics,
		gate.getDiagnostics,
	)
}

export const useDataSync = () =>
	useDataDiagnostics().some(
		({ status, updatedAt }) =>
			(status === 'loading' || status === 'blocked') && updatedAt === undefined,
	)
