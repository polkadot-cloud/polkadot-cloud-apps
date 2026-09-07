// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { type ResourceName, resolveDataPolicy } from '../policy'
import type {
	DataGateConfig,
	ResolvedDataGateConfig,
	Resource,
	ResourceDefinition,
	ResourceDiagnostic,
} from '../types'
import { createResource } from './resource'

export const createDataGate = (options: DataGateConfig) => {
	const config: ResolvedDataGateConfig = {
		...options,
		era: options.era ?? 0,
		nodeReady: !!options.node && (options.nodeReady ?? true),
		ss58: options.ss58 ?? 0,
		units: options.units ?? 10,
		erasPerDay: options.erasPerDay ?? 1,
		get node() {
			if (!options.node)
				throw new Error('This resource requires a node service')
			return options.node
		},
	}

	const policy = resolveDataPolicy(
		config.network,
		config.apiEnabled,
		config.modules,
	)
	let disposed = false
	let mounts = 0
	const resources = new Map<string, Resource<unknown>>()
	const diagnostics = new Map<string, ResourceDiagnostic>()
	let snapshot: ResourceDiagnostic[] = []
	const listeners = new Set<() => void>()
	const report = (diagnostic: ResourceDiagnostic) => {
		diagnostics.set(diagnostic.key, diagnostic)
		snapshot = [...diagnostics.values()]
		listeners.forEach((listener) => {
			listener()
		})
	}
	const resource = <T>(definition: ResourceDefinition<T>): Resource<T> => {
		if (disposed) throw new Error('Data gate has been disposed')
		const key = JSON.stringify([
			definition.name,
			policy.sources[definition.name],
			definition.enabled !== false,
			definition.key,
		])
		const cached = resources.get(key)
		if (cached) return cached as Resource<T>
		const resource = createResource(
			key,
			definition,
			config,
			policy,
			report,
			request,
		)
		resources.set(key, resource as Resource<unknown>)
		return resource
	}
	const request = async <T>(
		definition: ResourceDefinition<T>,
		options?: { refresh?: boolean },
	): Promise<T> => {
		const entry = resource(definition)
		const data = await (options?.refresh ? entry.refresh() : entry.read())
		if (entry.getSnapshot().status !== 'ready')
			throw (
				entry.getSnapshot().error ??
				new Error(`Resource unavailable: ${definition.name}`)
			)
		return data as T
	}
	const dispose = () => {
		if (disposed) return
		disposed = true
		resources.forEach((resource) => {
			resource.dispose()
		})
	}
	const mount = () => {
		if (disposed) throw new Error('Data gate has been disposed')
		mounts++
		return () => {
			mounts--
			queueMicrotask(() => {
				if (mounts === 0) dispose()
			})
		}
	}
	return {
		mount,
		config,
		policy,
		resource,
		request,
		invalidate: (names?: readonly ResourceName[]) => {
			for (const [key, resource] of resources) {
				const [name] = JSON.parse(key) as [ResourceName]
				if (!names || names.includes(name)) resource.invalidate()
			}
		},
		getDiagnostics: () => snapshot,
		subscribe: (listener: () => void) => {
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
			}
		},
		dispose,
	}
}

export type DataGate = ReturnType<typeof createDataGate>
