// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DataPolicy } from '../policy'
import type {
	ResolvedDataGateConfig,
	Resource,
	ResourceDefinition,
	ResourceDiagnostic,
	ResourceSnapshot,
} from '../types'

export const createResource = <T>(
	key: string,
	definition: ResourceDefinition<T>,
	config: ResolvedDataGateConfig,
	policy: DataPolicy,
	report: (diagnostic: ResourceDiagnostic) => void,
	request: <R>(definition: ResourceDefinition<R>) => Promise<R>,
): Resource<T> => {
	const source = policy.sources[definition.name]
	const refreshIntervalMs =
		typeof definition.refreshIntervalMs === 'number'
			? definition.refreshIntervalMs
			: source === 'disabled'
				? undefined
				: definition.refreshIntervalMs?.[source]
	let disposed = false
	const disabled = source === 'disabled' || definition.enabled === false
	const requirements = [
		...new Set([
			...(definition.requires ?? []),
			...(source === 'node' ? ['node' as const] : []),
		]),
	]
	const blocked = requirements.some((requirement) =>
		requirement === 'era' ? config.era === 0 : !config.nodeReady,
	)
	const initialStatus = disabled ? 'disabled' : blocked ? 'blocked' : 'idle'
	let snapshot: ResourceSnapshot<T> = {
		status: initialStatus,
		source,
		data: undefined,
		error: undefined,
		updatedAt: undefined,
	}
	const listeners = new Set<() => void>()
	let pending: Promise<T | undefined> | undefined
	let controller: AbortController | undefined
	let interval: ReturnType<typeof setInterval> | undefined
	let generation = 0
	let startedAt: number | undefined

	const publish = (next: ResourceSnapshot<T>) => {
		snapshot = next
		report({
			key,
			resource: definition.name,
			source,
			requires: requirements,
			status: snapshot.status,
			startedAt,
			updatedAt: snapshot.updatedAt,
			error: snapshot.error?.message,
		})
		listeners.forEach((listener) => {
			listener()
		})
	}
	const stopInterval = () => {
		if (interval) clearInterval(interval)
		interval = undefined
	}
	const cancel = () => {
		generation++
		controller?.abort()
		controller = undefined
		pending = undefined
	}
	const refresh = (): Promise<T | undefined> => {
		if (disposed || disabled || blocked) return Promise.resolve(undefined)
		if (pending) return pending
		const requestGeneration = ++generation
		const requestController = new AbortController()
		controller = requestController
		startedAt = Date.now()
		// Schedule the loader after pending is assigned, including when subscribers synchronously
		// request the same resource in response to its loading notification.
		pending = Promise.resolve().then(async () => {
			let timeout: ReturnType<typeof setTimeout> | undefined
			let onAbort: (() => void) | undefined
			try {
				const aborted = new Promise<never>((_, reject) => {
					onAbort = () => reject(new Error('Request cancelled'))
					requestController.signal.addEventListener('abort', onAbort, {
						once: true,
					})
					if (requestController.signal.aborted) onAbort()
					timeout = setTimeout(() => {
						reject(new Error(`Request timed out: ${definition.name}`))
						requestController.abort()
					}, config.requestTimeoutMs ?? 30_000)
				})
				const data = await Promise.race([
					aborted,
					requestController.signal.aborted
						? Promise.reject(new Error('Request cancelled'))
						: definition.load({
								network: config.network,
								apiEnabled: config.apiEnabled,
								modules: config.modules,
								era: config.era,
								nodeReady: config.nodeReady,
								ss58: config.ss58,
								units: config.units,
								erasPerDay: config.erasPerDay,
								get node() {
									return config.node
								},
								policy,
								signal: requestController.signal,
								request: (dependency) => {
									requestController.signal.throwIfAborted()
									return request(dependency)
								},
							}),
				])
				if (requestGeneration !== generation) return undefined
				publish({
					status: 'ready',
					source,
					data,
					error: undefined,
					updatedAt: Date.now(),
				})
				return data
			} catch (error) {
				if (requestGeneration === generation) {
					publish({
						...snapshot,
						status: 'error',
						error: error instanceof Error ? error : new Error(String(error)),
					})
				}
				return undefined
			} finally {
				clearTimeout(timeout)
				if (onAbort)
					requestController.signal.removeEventListener('abort', onAbort)
				if (requestGeneration === generation) pending = undefined
			}
		})
		publish({ ...snapshot, status: 'loading', error: undefined })
		return pending
	}
	const read = () =>
		snapshot.status === 'ready' &&
		(definition.staleTimeMs === undefined ||
			Date.now() - (snapshot.updatedAt ?? 0) < definition.staleTimeMs)
			? Promise.resolve(snapshot.data)
			: refresh()
	return {
		key,
		getSnapshot: () => snapshot,
		read,
		refresh,
		subscribe: (listener) => {
			listeners.add(listener)
			if (listeners.size === 1 && !disposed) {
				publish(snapshot)
				if (snapshot.status === 'idle') void read()
				if (!disabled && !blocked && refreshIntervalMs)
					interval = setInterval(refresh, refreshIntervalMs)
			}
			return () => {
				listeners.delete(listener)
				if (listeners.size === 0) stopInterval()
			}
		},
		invalidate: () => {
			cancel()
			publish({
				...snapshot,
				status: initialStatus,
				data: undefined,
				error: undefined,
				updatedAt: undefined,
			})
			if (listeners.size) void refresh()
		},
		dispose: () => {
			disposed = true
			stopInterval()
			cancel()
			if (snapshot.status === 'loading')
				publish({ ...snapshot, status: initialStatus })
		},
	}
}
