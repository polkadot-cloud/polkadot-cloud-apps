// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { QueryClient, QueryObserver, skipToken } from '@tanstack/react-query'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { dataPointOptions } from '../../data-gate/src/query'
import type {
	DataPointConfig,
	SubscriptionContext,
} from '../../data-gate/src/types'

const state = vi.hoisted(() => ({ network: 'polkadot', api: false }))
vi.mock('../../global-bus/src/index', () => ({
	getNetwork: () => state.network,
	pluginEnabled: () => state.api,
}))

const clients: QueryClient[] = []
const observers: { destroy: () => void }[] = []
const createClient = () => {
	const client = new QueryClient()
	clients.push(client)
	return client
}
const fixture = () => {
	const emissions: SubscriptionContext<number>[] = []
	const cleanups: ReturnType<typeof vi.fn>[] = []
	const subscribe = vi.fn((context: SubscriptionContext<number>) => {
		emissions.push(context)
		const cleanup = vi.fn()
		cleanups.push(cleanup)
		return cleanup
	})
	const fetch = vi.fn(async () => 99)
	const config: DataPointConfig<number> = {
		key: ['live-data', 'account'],
		node: { subscribe },
		stakingApi: { queryFn: fetch },
	}
	const options = () => dataPointOptions(config)
	const client = createClient()
	const watch = (queryClient = client) => {
		const observer = new QueryObserver(queryClient, options())
		observers.push(observer)
		observer.subscribe(() => {})
		return observer
	}
	return {
		emissions,
		cleanups,
		subscribe,
		fetch,
		config,
		options,
		client,
		watch,
	}
}

beforeEach(() => {
	state.network = 'polkadot'
	state.api = false
})
afterEach(() => {
	for (const observer of observers.splice(0)) observer.destroy()
	for (const client of clients.splice(0)) client.clear()
})

test('one subscription serves concurrent consumers and emissions replace data without refetching', async () => {
	const f = fixture()
	const first = f.watch()
	const second = f.watch()
	expect(f.subscribe).toHaveBeenCalledTimes(1)
	expect(first.getCurrentResult()).toMatchObject({
		status: 'pending',
		data: undefined,
	})
	f.emissions[0].next(1)
	await vi.waitFor(() => expect(first.getCurrentResult().data).toBe(1))
	expect(first.getCurrentResult().fetchStatus).toBe('idle')
	const third = f.watch()
	f.emissions[0].next(2)
	for (const observer of [first, second, third])
		expect(observer.getCurrentResult().data).toBe(2)
	expect(f.subscribe).toHaveBeenCalledTimes(1)
	expect(f.fetch).not.toHaveBeenCalled()
	first.destroy()
	second.destroy()
	expect(f.cleanups[0]).not.toHaveBeenCalled()
	third.destroy()
	expect(f.cleanups[0]).toHaveBeenCalledTimes(1)
	expect(f.emissions[0].signal.aborted).toBe(true)
	f.emissions[0].next(3)
	expect(f.client.getQueryData(f.options().queryKey)).toBe(2)
})

test('remounting a cached subscription reconnects and explicit refetch waits for its first new value', async () => {
	const f = fixture()
	const first = f.watch()
	f.emissions[0].next(1)
	await vi.waitFor(() => expect(first.getCurrentResult().data).toBe(1))
	first.destroy()
	const second = f.watch()
	expect(f.subscribe).toHaveBeenCalledTimes(2)
	f.emissions[1].next(2)
	await vi.waitFor(() => expect(second.getCurrentResult().data).toBe(2))
	const refresh = second.refetch()
	expect(f.cleanups[1]).toHaveBeenCalledTimes(1)
	expect(f.subscribe).toHaveBeenCalledTimes(3)
	f.emissions[1].next(100)
	f.emissions[2].next(3)
	expect((await refresh).data).toBe(3)
	f.emissions[2].next(4)
	expect(second.getCurrentResult().data).toBe(4)
})

test.each(['source', 'network', 'key', 'readiness'])(
	'changing %s releases the old subscription and isolates late emissions',
	async (change) => {
		const f = fixture()
		const observer = f.watch()
		f.emissions[0].next(1)
		await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(1))
		if (change === 'source') state.api = true
		if (change === 'network') state.network = 'kusama'
		if (change === 'key') f.config.key = ['live-data', 'new-account']
		if (change === 'readiness') f.config.node.enabled = false
		observer.setOptions(f.options())
		expect(f.cleanups[0]).toHaveBeenCalledTimes(1)
		f.emissions[0].next(100)
		if (change === 'source') {
			await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(99))
			expect(f.subscribe).toHaveBeenCalledTimes(1)
			state.api = false
			observer.setOptions(f.options())
		} else if (change === 'readiness') {
			expect(observer.getCurrentResult()).toMatchObject({
				data: undefined,
				fetchStatus: 'idle',
			})
			expect(f.subscribe).toHaveBeenCalledTimes(1)
			f.config.node.enabled = true
			observer.setOptions(f.options())
		}
		expect(f.subscribe).toHaveBeenCalledTimes(2)
		expect(f.emissions[1].network).toBe(state.network)
		f.emissions[1].next(2)
		await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(2))
	},
)

test('an API fetch never starts the node subscription and missing subscription inputs stay disabled', async () => {
	const f = fixture()
	state.api = true
	expect(await f.client.fetchQuery(f.options())).toBe(99)
	expect(f.subscribe).not.toHaveBeenCalled()
	state.api = false
	f.config.node = { subscribe: skipToken }
	const observer = f.watch()
	expect(observer.getCurrentResult().fetchStatus).toBe('idle')
	expect(f.subscribe).not.toHaveBeenCalled()
})

test.each([false, true])(
	'async subscription cleanup runs after unmount (first value received: %s)',
	async (emit) => {
		const f = fixture()
		let finish!: (cleanup: () => void) => void
		let context!: SubscriptionContext<number>
		f.config.node = {
			subscribe: (input) => {
				context = input
				return new Promise<() => void>((resolve) => {
					finish = resolve
				})
			},
		}
		const observer = f.watch()
		if (emit) {
			context.next(1)
			await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(1))
		}
		observer.destroy()
		expect(context.signal.aborted).toBe(true)
		const cleanup = vi.fn()
		finish(cleanup)
		await vi.waitFor(() => expect(cleanup).toHaveBeenCalledTimes(1))
		context.next(2)
		expect(f.client.getQueryData(f.options().queryKey)).toBe(
			emit ? 1 : undefined,
		)
	},
)

test.each(['throw', 'reject', 'callback'])(
	'initial subscription %s becomes a query error',
	async (mode) => {
		const f = fixture()
		const cleanup = vi.fn()
		f.config.node = {
			subscribe: ({ error }) => {
				if (mode === 'throw') throw new Error('offline')
				if (mode === 'reject') return Promise.reject(new Error('offline'))
				error(new Error('offline'))
				return cleanup
			},
		}
		const observer = f.watch()
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().error?.message).toBe('offline'),
		)
		expect(observer.getCurrentResult().data).toBeUndefined()
		expect(f.fetch).not.toHaveBeenCalled()
		if (mode === 'callback') expect(cleanup).toHaveBeenCalledTimes(1)
	},
)

test('stream errors retain the last value, stop the subscription, and can be explicitly retried', async () => {
	const f = fixture()
	const observer = f.watch()
	f.emissions[0].next(1)
	await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(1))
	f.emissions[0].error(new Error('disconnected'))
	expect(observer.getCurrentResult()).toMatchObject({
		status: 'error',
		data: 1,
	})
	expect(observer.getCurrentResult().error?.message).toBe('disconnected')
	expect(f.cleanups[0]).toHaveBeenCalledTimes(1)
	const retry = observer.refetch()
	f.emissions[1].next(2)
	expect((await retry).data).toBe(2)
	expect(observer.getCurrentResult().error).toBeNull()
})

test.each([false, true])(
	'synchronous emissions preserve the latest value and an immediate error: %s',
	async (fail) => {
		const f = fixture()
		const cleanup = vi.fn()
		f.config.node = {
			subscribe: ({ next, error }) => {
				next(1)
				next(2)
				if (fail) error(new Error('disconnected'))
				return cleanup
			},
		}
		const observer = f.watch()
		await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(2))
		expect(observer.getCurrentResult().status).toBe(fail ? 'error' : 'success')
		if (fail) expect(cleanup).toHaveBeenCalledTimes(1)
	},
)

test('imperative reads release their subscription after returning a snapshot', async () => {
	const f = fixture()
	const pending = f.client.fetchQuery(f.options())
	f.emissions[0].next(1)
	expect(await pending).toBe(1)
	expect(f.cleanups[0]).toHaveBeenCalledTimes(1)
	expect(f.emissions[0].signal.aborted).toBe(true)
})

test('separate query clients own independent subscriptions and clearing the cache stops them', async () => {
	const f = fixture()
	const first = f.watch()
	const secondClient = createClient()
	const second = f.watch(secondClient)
	f.emissions[0].next(1)
	f.emissions[1].next(2)
	await vi.waitFor(() => expect(first.getCurrentResult().data).toBe(1))
	expect(second.getCurrentResult().data).toBe(2)
	f.client.clear()
	expect(f.cleanups[0]).toHaveBeenCalledTimes(1)
	expect(f.cleanups[1]).not.toHaveBeenCalled()
	f.emissions[0].next(100)
	expect(f.client.getQueryCache().getAll()).toHaveLength(0)
})

test('refetch during initial loading shares the pending subscription', async () => {
	const f = fixture()
	const observer = f.watch()
	const refresh = observer.refetch()
	expect(f.subscribe).toHaveBeenCalledTimes(1)
	f.emissions[0].next(1)
	expect((await refresh).data).toBe(1)
	expect(f.cleanups[0]).not.toHaveBeenCalled()
})

test('the API source can also subscribe while the node source fetches', async () => {
	const f = fixture()
	f.config.node = { queryFn: f.fetch }
	f.config.stakingApi = { subscribe: f.subscribe }
	state.api = true
	const observer = f.watch()
	f.emissions[0].next(1)
	await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(1))
	expect(f.fetch).not.toHaveBeenCalled()
	state.api = false
	observer.setOptions(f.options())
	await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(99))
	expect(f.cleanups[0]).toHaveBeenCalledTimes(1)
})
