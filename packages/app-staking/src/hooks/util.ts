// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
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
 *
 * The second argument is detected via `typeof` to choose one of two snapshot strategies:
 *   - Value mode (non-function): seeds `currentSnapshot` from the initial value, then overwrites it
 *     with each emitted value. The emitted value is cast to `T` — no compile-time check.
 *   - Getter mode (function): calls the getter to seed `currentSnapshot`, then re-calls it on every
 *     emission and on each 0→1 re-subscribe (to recover from emissions that arrived while
 *     detached). The emitted value is ignored; the observable acts only as a change trigger.
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
				// Getter mode only: re-read before subscribing so the snapshot is current if emissions
				// arrived while no listener was attached.
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
