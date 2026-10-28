// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryFunction } from '@tanstack/react-query'
import { firstValueFrom, fromEvent, ReplaySubject, Subscription } from 'rxjs'
import type { NetworkId } from 'types'
import type { Subscribe } from './types'

// Query objects scope sharing to a client and a complete query key. Weak keys let discarded cache
// entries be garbage-collected.
const subscriptions = new WeakMap<object, Subscription>()
export const hasSubscription = (query: object) => subscriptions.has(query)

// Resolve the query with the first emission, then publish live updates to its cache.
export const subscriptionQuery =
	<T>(subscribe: Subscribe<T>, network: NetworkId): QueryFunction<T> =>
	({ client, queryKey, signal }) => {
		const cache = client.getQueryCache()
		const query = cache.find<T>({ queryKey, exact: true })!

		// When Query starts another execution (e.g. refetch), replace the old stream.
		subscriptions.get(query)?.unsubscribe()

		// Retain the latest value, including synchronous emissions during setup.
		const values = new ReplaySubject<T>(1)
		const controller = new AbortController()

		// One lifetime owns the source cleanup and both event listeners. Its abort signal remains
		// useful after the initial query promise has resolved.
		const lifetime = new Subscription(() => {
			subscriptions.delete(query)
			// Close emissions before aborting: source abort handlers may call next/error.
			values.complete()
			controller.abort()
		})

		const stop = () => lifetime.unsubscribe()
		const error = (reason: unknown) =>
			values.error(reason instanceof Error ? reason : new Error(String(reason)))

		// Listen before starting the source. Initial errors reject the query normally.
		const first = firstValueFrom(values).catch((reason) => {
			stop()
			throw reason
		})

		subscriptions.set(query, lifetime)

		// Query cancellation covers the initial fetch; cache events below also cover unmounting after
		// that fetch has completed.
		lifetime.add(fromEvent(signal, 'abort').subscribe(stop))

		let committed = false
		lifetime.add(
			cache.subscribe((event) => {
				if (event.query !== query) return

				// Multiple consumers share the stream until the last observer leaves.
				if (
					event.type === 'removed' ||
					(event.type === 'observerRemoved' && !query.getObserversCount())
				) {
					stop()
				} else if (
					!committed &&
					event.type === 'updated' &&
					event.action.type === 'success' &&
					!event.action.manual
				) {
					// Wait for Query's own success commit before forwarding cached emissions: otherwise the
					// first result could overwrite a newer synchronous value. Set the guard before
					// subscribing, since replay writes to the cache too.
					committed = true
					lifetime.add(
						values.subscribe({
							// Update consumers directly; later emissions do not trigger a refetch.
							next: (value) => query.setData(value, { manual: true }),
							error: (reason: Error) => {
								// The initial promise has settled, so report later failures through query state,
								// keeping the last data available, then release the stream.
								query.setState({
									status: 'error',
									error: reason,
									errorUpdatedAt: Date.now(),
									errorUpdateCount: query.state.errorUpdateCount + 1,
								})
								stop()
							},
						}),
					)
					// An imperative fetchQuery reads one snapshot; it owns no ongoing subscription.
					if (!query.getObserversCount()) stop()
				}
			}),
		)

		// Do not start a source for a query that was already cancelled.
		if (signal.aborted) stop()
		else {
			try {
				const setup = subscribe({
					network,
					signal: controller.signal,
					error,
					// Match Query's requirement that successful data cannot be undefined.
					next: (value) =>
						value === undefined
							? error(new Error('Subscription emitted undefined'))
							: values.next(value),
				})
				// Setup may return cleanup asynchronously. RxJS immediately runs it if cancellation
				// happened while setup was pending.
				Promise.resolve(setup).then((cleanup) => lifetime.add(cleanup), error)
			} catch (reason) {
				error(reason)
			}
		}
		// Fetch/refetch awaits one result, not the lifetime of the subscription.
		return first
	}
