// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSyncExternalStore } from 'react'

type Listener = () => void
type SnapshotInput<T> = T | (() => T)
type SnapshotSetter<T> = T | ((current: T) => T)

interface SingletonSignalOptions {
	onBeforeFirstSubscribe?: () => void
	onFirstSubscribe?: () => void
	onLastUnsubscribe?: () => void
}

export interface SingletonSignal {
	emit: () => void
	getListenerCount: () => number
	subscribe: (listener: Listener) => () => void
}

export interface SingletonStore<T> extends SingletonSignal {
	getSnapshot: () => T
	getServerSnapshot: () => T
	patchSnapshot: (patch: Partial<T> | ((current: T) => Partial<T>)) => T
	refreshSnapshot: () => T
	resetSnapshot: () => T
	setSnapshot: (next: SnapshotSetter<T>) => T
}

interface SingletonStoreOptions<T> extends SingletonSignalOptions {
	serverSnapshot?: SnapshotInput<T>
}

const readSnapshot = <T>(snapshot: SnapshotInput<T>) =>
	typeof snapshot === 'function' ? (snapshot as () => T)() : snapshot

export const createSingletonSignal = (
	options: SingletonSignalOptions = {},
): SingletonSignal => {
	const listeners = new Set<Listener>()

	const emit = () => {
		for (const listener of listeners) {
			listener()
		}
	}

	return {
		emit,
		getListenerCount: () => listeners.size,
		subscribe: (listener) => {
			const wasEmpty = listeners.size === 0
			if (wasEmpty) {
				options.onBeforeFirstSubscribe?.()
			}
			listeners.add(listener)
			if (wasEmpty) {
				options.onFirstSubscribe?.()
			}

			return () => {
				const deleted = listeners.delete(listener)
				if (deleted && listeners.size === 0) {
					options.onLastUnsubscribe?.()
				}
			}
		},
	}
}

export const createSingletonStore = <T>(
	initialSnapshot: SnapshotInput<T>,
	options: SingletonStoreOptions<T> = {},
): SingletonStore<T> => {
	let currentSnapshot = readSnapshot(initialSnapshot)
	const getInitialSnapshot = () => readSnapshot(initialSnapshot)
	const getServerSnapshot = options.serverSnapshot
		? () => readSnapshot(options.serverSnapshot as SnapshotInput<T>)
		: () => currentSnapshot
	const signal = createSingletonSignal(options)

	const setSnapshot = (next: SnapshotSetter<T>) => {
		currentSnapshot =
			typeof next === 'function'
				? (next as (current: T) => T)(currentSnapshot)
				: next
		signal.emit()
		return currentSnapshot
	}

	return {
		...signal,
		getSnapshot: () => currentSnapshot,
		getServerSnapshot,
		patchSnapshot: (patch) =>
			setSnapshot((current) => ({
				...current,
				...(typeof patch === 'function'
					? (patch as (current: T) => Partial<T>)(current)
					: patch),
			})),
		refreshSnapshot: () => setSnapshot(getInitialSnapshot()),
		resetSnapshot: () => setSnapshot(getInitialSnapshot()),
		setSnapshot,
	}
}

export const useSingletonStore = <T>(store: SingletonStore<T>) =>
	useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot,
	)
