// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId, ServiceInterface } from 'types'
import type { DataModule, DataPolicy, DataSource, ResourceName } from './policy'

export interface DataGateConfig {
	network: NetworkId
	apiEnabled: boolean
	modules: readonly DataModule[]
	era?: number
	node?: ServiceInterface
	nodeReady?: boolean
	ss58?: number
	units?: number
	erasPerDay?: number
	requestTimeoutMs?: number
}

export type ResourceState =
	| 'idle'
	| 'blocked'
	| 'loading'
	| 'ready'
	| 'error'
	| 'disabled'
export interface ResourceSnapshot<T> {
	status: ResourceState
	data: T | undefined
	error: Error | undefined
	source: DataSource
	updatedAt: number | undefined
}

export interface ResolvedDataGateConfig extends DataGateConfig {
	era: number
	node: ServiceInterface
	nodeReady: boolean
	ss58: number
	units: number
	erasPerDay: number
}

export interface ResourceContext extends ResolvedDataGateConfig {
	policy: DataPolicy
	signal: AbortSignal
	request: <T>(definition: ResourceDefinition<T>) => Promise<T>
}

export interface ResourceDefinition<T> {
	name: ResourceName
	key: readonly unknown[]
	// The source chooses its prerequisites. API-backed queries should not wait for the node.
	requires?: readonly ('era' | 'node')[]
	enabled?: boolean
	staleTimeMs?: number
	refreshIntervalMs?:
		| number
		| Partial<Record<Exclude<DataSource, 'disabled'>, number>>
	load: (context: ResourceContext) => Promise<T>
}

export interface Resource<T> {
	key: string
	getSnapshot: () => ResourceSnapshot<T>
	subscribe: (listener: () => void) => () => void
	refresh: () => Promise<T | undefined>
	read: () => Promise<T | undefined>
	invalidate: () => void
	dispose: () => void
}

export interface ResourceDiagnostic {
	key: string
	resource: ResourceName
	source: DataSource
	requires: readonly string[]
	status: ResourceState
	startedAt?: number
	updatedAt?: number
	error?: string
}
