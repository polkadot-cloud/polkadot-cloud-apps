// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Observable } from 'rxjs'

interface ObservableStore<TSnapshot> {
	subscribe: (listener: () => void) => () => void
	getSnapshot: () => TSnapshot
}

/**
 * Creates a ref-counted bridge between an RxJS observable and React's useSyncExternalStore.
 *
 * The RxJS subscription is created on the 0→1 listener transition and torn down on the 1→0
 * transition, so the observable has no subscribers while no hook instance is mounted.
 */
export function createObservableStore<T>(
	observable$: Observable<unknown>,
	initialOrGetSnapshot: T | (() => T),
): ObservableStore<T> {
	const isGetter = typeof initialOrGetSnapshot === 'function'
	const readFromGetter = () => (initialOrGetSnapshot as () => T)()
	let currentSnapshot: T = isGetter ? readFromGetter() : initialOrGetSnapshot
	const listeners = new Set<() => void>()
	let rxSubscription: { unsubscribe(): void } | null = null

	return {
		subscribe(listener) {
			if (listeners.size === 0) {
				if (isGetter) {
					currentSnapshot = readFromGetter()
				}
				rxSubscription = observable$.subscribe((value) => {
					currentSnapshot = isGetter ? readFromGetter() : (value as T)
					for (const l of listeners) {
						l()
					}
				})
			}
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
				if (listeners.size === 0) {
					rxSubscription?.unsubscribe()
					rxSubscription = null
				}
			}
		},
		getSnapshot() {
			return currentSnapshot
		},
	}
}
