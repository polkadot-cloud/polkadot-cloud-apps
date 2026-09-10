// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	QueryClient,
	QueryClientProvider,
	QueryObserver,
} from '@tanstack/react-query'
import type { ErasStakersPagedEntries, ServiceInterface } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import {
	nominationStatusOptions,
	useNominationStatus,
} from '../../data-gate/src/nominationStatus'
import { DataGateContext } from '../../data-gate/src/provider'
import { dataPointOptions } from '../../data-gate/src/query'
import { createDataGateStore } from '../../data-gate/src/state'
import type { DataGateState, DataPointConfig } from '../../data-gate/src/types'
import { useDataPoint } from '../../data-gate/src/useDataPoint'
import { resetActiveEra, setActiveEra } from '../../global-bus/src/activeEra'
import { resetApiStatus, setApiStatus } from '../../global-bus/src/apiStatus'
import { getNetwork, setNetwork } from '../../global-bus/src/networkConfig'
import {
	getAvailablePlugins,
	getPlugins,
	pluginEnabled,
	plugins$,
	setPlugins,
} from '../../global-bus/src/plugins'
import {
	resetServiceInterface,
	setServiceInterface,
} from '../../global-bus/src/serviceInterface'
import { defaultServiceInterface } from '../../global-bus/src/serviceInterface/default'

const { apiQuery, storage } = vi.hoisted(() => {
	const storage = new Map<string, string>()
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => {
			storage.set(key, value)
		},
		removeItem: (key: string) => {
			storage.delete(key)
		},
	})
	return { apiQuery: vi.fn(), storage }
})

// Provide browser startup defaults while exercising the real network and plugin stores.
vi.mock('../../global-bus/src/networkConfig/util', () => ({
	getInitialNetwork: () => 'polkadot',
	getInitialProviderType: () => 'ws',
	getInitialAutoRpc: () => false,
}))
vi.mock('../../global-bus/src/index', async () => ({
	...(await import('../../global-bus/src/networkConfig')),
	...(await import('../../global-bus/src/plugins')),
	...(await import('../../global-bus/src/activeEra')),
	...(await import('../../global-bus/src/apiStatus')),
	...(await import('../../global-bus/src/serviceInterface')),
}))
vi.mock('../../plugin-staking-api/src/Client', () => ({
	client: { query: apiQuery },
}))

const clients: QueryClient[] = []
const observers: { destroy: () => void }[] = []
const createClient = () => {
	const client = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } })
	clients.push(client)
	return client
}
const deferred = <T>() => {
	let resolve!: (value: T) => void
	const promise = new Promise<T>((done) => {
		resolve = done
	})
	return { promise, resolve }
}
const apiResult = (status: string) => ({
	data: { getNominationStatus: { status } },
})
const page = (who: string, index = 0): ErasStakersPagedEntries[number] => [
	[100, 'validator', index],
	{ pageTotal: 10n, others: [{ who, value: 10n }] },
]
const overview = { own: 0n, total: 10n, nominatorCount: 1, pageCount: 1 }
const config = (api = false) => {
	setPlugins(api ? ['staking_api'] : [])
	const node = vi.mockObject(defaultServiceInterface)
	node.query.nominatorsMulti.mockResolvedValue([
		{ targets: ['validator'], submittedIn: 99, suppressed: false },
	])
	node.query.erasStakersOverview.mockResolvedValue(overview)
	node.query.erasStakersPagedEntries.mockResolvedValue([page('stash')])
	return { node, ready: true, era: 100 }
}
const expectNoNodeQueries = ({ query }: ServiceInterface) => {
	const { accountBalance, ...queries } = query
	for (const read of Object.values({ ...accountBalance, ...queries }))
		expect(read).not.toHaveBeenCalled()
}
const observe = (
	input: DataGateState,
	who: string | null = 'stash',
	client = createClient(),
) => {
	const observer = new QueryObserver(
		client,
		nominationStatusOptions(input, who),
	)
	observers.push(observer)
	observer.subscribe(() => {})
	return observer
}

beforeEach(() => {
	storage.clear()
	resetActiveEra()
	resetApiStatus()
	resetServiceInterface()
	setNetwork('polkadot')
	setPlugins([])
	apiQuery.mockReset()
})
afterEach(() => {
	for (const observer of observers.splice(0)) observer.destroy()
	for (const client of clients.splice(0)) client.clear()
})

test('provider state reads current bus values and follows all source changes', () => {
	const input = config()
	setServiceInterface(input.node)
	setActiveEra({ index: 100, start: 0n })
	setApiStatus('polkadot', 'ready')
	const store = createDataGateStore()
	expect(store.getSnapshot()).toEqual(input)
	const listener = vi.fn()
	const unsubscribe = store.subscribe(listener)
	try {
		setNetwork('kusama')
		expect(store.getSnapshot().ready).toBe(false)
		setApiStatus('kusama', 'ready')
		expect(store.getSnapshot().ready).toBe(true)
		setActiveEra({ index: 101, start: 0n })
		expect(store.getSnapshot().era).toBe(101)
		const replacement = vi.mockObject(defaultServiceInterface)
		setServiceInterface(replacement)
		expect(store.getSnapshot().node).toBe(replacement)

		// Plugin changes must notify consumers even if node inputs stay the same.
		const previous = store.getSnapshot()
		listener.mockClear()
		setPlugins(['staking_api'])
		expect(listener).toHaveBeenCalled()
		expect(store.getSnapshot()).not.toBe(previous)
	} finally {
		unsubscribe()
	}
	listener.mockClear()
	setActiveEra({ index: 102, start: 0n })
	expect(listener).not.toHaveBeenCalled()
})

test('bus readiness and era updates start a pending node query without app props', async () => {
	const input = config()
	setServiceInterface(input.node)
	const store = createDataGateStore()
	const observer = observe(store.getSnapshot())
	const unsubscribe = store.subscribe(() => {
		observer.setOptions(nominationStatusOptions(store.getSnapshot(), 'stash'))
	})
	try {
		setApiStatus('polkadot', 'ready')
		expect(observer.getCurrentResult().fetchStatus).toBe('idle')
		expectNoNodeQueries(input.node)
		setActiveEra({ index: 100, start: 0n })
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('active'),
		)
		expect(input.node.query.nominatorsMulti).toHaveBeenCalledTimes(1)
		expect(apiQuery).not.toHaveBeenCalled()
	} finally {
		unsubscribe()
	}
})

test('data points have independent caches for each data point and source', async () => {
	setPlugins(['staking_api'])
	const nodeQuery = vi.fn(async () => ({ total: 10 }))
	const stakingApiQuery = vi.fn(async () => ({ total: 20 }))
	const definition: DataPointConfig<{ total: number }> = {
		key: ['first-total'],
		node: { queryFn: nodeQuery },
		stakingApi: { queryFn: stakingApiQuery },
	}
	const client = createClient()
	const first = dataPointOptions(definition)
	const second = dataPointOptions({
		...definition,
		key: ['second-total'],
	})
	expect((await client.fetchQuery(first)).total).toBe(20)
	expect((await client.fetchQuery(second)).total).toBe(20)
	expect(stakingApiQuery).toHaveBeenCalledTimes(2)
	expect(nodeQuery).not.toHaveBeenCalled()

	setPlugins([])
	const nodeOptions = dataPointOptions(definition)
	expect((await client.fetchQuery(nodeOptions)).total).toBe(10)
	expect(nodeQuery).toHaveBeenCalledTimes(1)
})

test('an unready selected API waits without starting a ready node source', async () => {
	setPlugins(['staking_api'])
	const nodeQuery = vi.fn(async () => 10)
	const stakingApiQuery = vi.fn(async () => 20)
	const definition: DataPointConfig<number> = {
		key: ['deferred-total'],
		node: { queryFn: nodeQuery },
		stakingApi: { enabled: false, queryFn: stakingApiQuery },
	}
	const observer = new QueryObserver(
		createClient(),
		dataPointOptions(definition),
	)
	observers.push(observer)
	observer.subscribe(() => {})
	expect(observer.getCurrentResult()).toMatchObject({
		status: 'pending',
		fetchStatus: 'idle',
	})
	expect(nodeQuery).not.toHaveBeenCalled()
	expect(stakingApiQuery).not.toHaveBeenCalled()

	definition.stakingApi.enabled = true
	observer.setOptions(dataPointOptions(definition))
	await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(20))
	expect(nodeQuery).not.toHaveBeenCalled()
})

test('API status resolves before node readiness or an era, without any node calls', async () => {
	const input = config(true)
	input.ready = false
	input.era = 0
	apiQuery.mockResolvedValue(apiResult('active'))
	expect(
		await createClient().fetchQuery(nominationStatusOptions(input, 'stash')),
	).toBe('active')
	expectNoNodeQueries(input.node)
	expect(apiQuery.mock.calls[0][0]).toMatchObject({
		variables: { network: 'polkadot', who: 'stash' },
		fetchPolicy: 'no-cache',
	})
})

test.each(['active', 'inactive', 'waiting'])(
	'preserves the API status %s',
	async (status) => {
		apiQuery.mockResolvedValue(apiResult(status))
		expect(
			await createClient().fetchQuery(
				nominationStatusOptions(config(true), 'stash'),
			),
		).toBe(status)
	},
)

test.each(['failure', 'empty', 'invalid'])(
	'API %s is an error and never starts node fallback',
	async (kind) => {
		const input = config(true)
		if (kind === 'failure') apiQuery.mockRejectedValue(new Error('offline'))
		else
			apiQuery.mockResolvedValue(
				kind === 'empty' ? { data: undefined } : apiResult('unknown'),
			)
		await expect(
			createClient().fetchQuery(nominationStatusOptions(input, 'stash')),
		).rejects.toThrow()
		expectNoNodeQueries(input.node)
	},
)

test.each([
	{ ready: false, era: 100 },
	{ ready: true, era: 0 },
])(
	'node status remains pending until prerequisites are met: %j',
	async (prerequisites) => {
		const input = config()
		Object.assign(input, prerequisites)
		const observer = observe(input)
		expect(observer.getCurrentResult()).toMatchObject({
			status: 'pending',
			fetchStatus: 'idle',
			data: undefined,
		})
		expect(input.node.query.nominatorsMulti).not.toHaveBeenCalled()
		input.ready = true
		input.era = 100
		observer.setOptions(nominationStatusOptions(input, 'stash'))
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('active'),
		)
		expect(apiQuery).not.toHaveBeenCalled()
	},
)

test('missing accounts do not fetch from either source', () => {
	for (const api of [true, false]) {
		const input = config(api)
		const observer = observe(input, null)
		expect(observer.getCurrentResult().fetchStatus).toBe('idle')
		expectNoNodeQueries(input.node)
	}
	expect(apiQuery).not.toHaveBeenCalled()
})

test('node status waits for complete pages, including backing on a later page', async () => {
	const input = config()
	const pending = deferred<ErasStakersPagedEntries>()
	input.node.query.erasStakersOverview.mockResolvedValue({
		...overview,
		pageCount: 2,
	})
	input.node.query.erasStakersPagedEntries.mockReturnValue(pending.promise)
	const observer = observe(input)
	await vi.waitFor(() =>
		expect(input.node.query.erasStakersPagedEntries).toHaveBeenCalledWith(
			100,
			'validator',
		),
	)
	expect(observer.getCurrentResult()).toMatchObject({
		status: 'pending',
		data: undefined,
	})
	pending.resolve([page('someone-else'), page('stash', 1)])
	await vi.waitFor(() =>
		expect(observer.getCurrentResult().data).toBe('active'),
	)
	expect(apiQuery).not.toHaveBeenCalled()
})

test('queries only unique nomination targets and aggregates active before inactive before waiting', async () => {
	const input = config()
	input.node.query.nominatorsMulti.mockResolvedValue([
		{
			targets: ['waiting', 'inactive', 'active', 'active'],
			submittedIn: 99,
			suppressed: false,
		},
	])
	input.node.query.erasStakersOverview.mockImplementation(async (_, target) =>
		target === 'waiting' ? undefined : overview,
	)
	input.node.query.erasStakersPagedEntries.mockImplementation(
		async (_, target) => [
			page(target === 'active' ? 'stash' : 'another-stash'),
		],
	)
	expect(
		await createClient().fetchQuery(nominationStatusOptions(input, 'stash')),
	).toBe('active')
	expect(input.node.query.erasStakersOverview).toHaveBeenCalledTimes(3)
	expect(input.node.query.erasStakersPagedEntries.mock.calls).toEqual([
		[100, 'inactive'],
		[100, 'active'],
	])
})

test('inactive, waiting and empty nomination sets are valid node results', async () => {
	const input = config()
	input.node.query.erasStakersPagedEntries.mockResolvedValue([
		page('another-stash'),
	])
	expect(
		await createClient().fetchQuery(nominationStatusOptions(input, 'stash')),
	).toBe('inactive')
	input.node.query.erasStakersOverview.mockResolvedValue(undefined)
	expect(
		await createClient().fetchQuery(nominationStatusOptions(input, 'stash')),
	).toBe('waiting')
	input.node.query.nominatorsMulti.mockResolvedValue([undefined])
	input.node.query.erasStakersOverview.mockClear()
	expect(
		await createClient().fetchQuery(nominationStatusOptions(input, 'stash')),
	).toBe('waiting')
	expect(input.node.query.erasStakersOverview).not.toHaveBeenCalled()
})

test('incomplete node data is an error instead of an inactive status', async () => {
	const input = config()
	input.node.query.erasStakersPagedEntries.mockResolvedValue([])
	await expect(
		createClient().fetchQuery(nominationStatusOptions(input, 'stash')),
	).rejects.toThrow('Incomplete exposure pages')
})

test('concurrent consumers share requests and refresh bypasses the settled result', async () => {
	const client = createClient()
	const input = config(true)
	const pending = deferred<ReturnType<typeof apiResult>>()
	apiQuery.mockReturnValue(pending.promise)
	const options = nominationStatusOptions(input, 'stash')
	const first = client.fetchQuery(options)
	const second = client.fetchQuery(options)
	expect(apiQuery).toHaveBeenCalledTimes(1)
	pending.resolve(apiResult('active'))
	expect(await Promise.all([first, second])).toEqual(['active', 'active'])
	const observer = observe(input, 'stash', client)
	apiQuery.mockResolvedValue(apiResult('inactive'))
	await observer.refetch()
	expect(observer.getCurrentResult().data).toBe('inactive')
	expect(apiQuery).toHaveBeenCalledTimes(2)
})

test.each([true, false])(
	'cached status does not refetch because of its age (API enabled: %s)',
	async (api) => {
		const input = config(api)
		const client = createClient()
		const options = nominationStatusOptions(input, 'stash')
		client.setQueryData(options.queryKey, 'active', { updatedAt: 1 })

		const observer = observe(input, 'stash', client)
		expect(observer.getCurrentResult().data).toBe('active')
		expect(await client.fetchQuery(options)).toBe('active')
		expectNoNodeQueries(input.node)
		expect(apiQuery).not.toHaveBeenCalled()
	},
)

test.each(['account', 'network', 'era', 'source', 'dependencies'])(
	'late results cannot overwrite a changed %s',
	async (change) => {
		const input = config(true)
		const pending = deferred<ReturnType<typeof apiResult>>()
		apiQuery
			.mockReturnValueOnce(pending.promise)
			.mockResolvedValue(apiResult('waiting'))
		const observer = observe(input)
		if (change === 'network') setNetwork('kusama')
		if (change === 'era') input.era++
		if (change === 'source') setPlugins([])
		observer.setOptions(
			nominationStatusOptions(
				input,
				change === 'account' ? 'new-stash' : 'stash',
				{ dependencies: change === 'dependencies' ? ['changed-nominees'] : [] },
			),
		)
		expect(observer.getCurrentResult().data).toBeUndefined()
		const expected = change === 'source' ? 'active' : 'waiting'
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe(expected),
		)
		pending.resolve(apiResult('inactive'))
		await pending.promise
		expect(observer.getCurrentResult().data).toBe(expected)
	},
)

test('cancelling a node status prevents subsequent exposure requests', async () => {
	const input = config()
	const pending = deferred<typeof overview>()
	input.node.query.erasStakersOverview.mockReturnValue(pending.promise)
	const observer = observe(input)
	await vi.waitFor(() =>
		expect(input.node.query.erasStakersOverview).toHaveBeenCalled(),
	)
	observer.destroy()
	pending.resolve(overview)
	await pending.promise
	await Promise.resolve()
	expect(input.node.query.erasStakersPagedEntries).not.toHaveBeenCalled()
})

test('global plugin selection follows network restrictions without a mounted hook', () => {
	setPlugins(['staking_api', 'polkawatch'])
	expect(pluginEnabled('staking_api')).toBe(true)
	setNetwork('paseo')
	expect(pluginEnabled('staking_api')).toBe(false)
	expect(getPlugins()).toEqual(['polkawatch'])
	expect(getAvailablePlugins().activePlugins).toEqual(['polkawatch'])
	expect(JSON.parse(storage.get('plugins')!)).toEqual([
		'staking_api',
		'polkawatch',
	])
	setNetwork('kusama')
	expect(pluginEnabled('staking_api')).toBe(true)
	setPlugins(['polkawatch'])
	setNetwork('polkadot')
	expect(pluginEnabled('staking_api')).toBe(false)
})

test('bus notifications switch the gate between sources and networks', async () => {
	const input = config(true)
	apiQuery.mockResolvedValue(apiResult('waiting'))
	const observer = observe(input)
	const subscription = plugins$.subscribe(() => {
		observer.setOptions(nominationStatusOptions(input, 'stash'))
	})
	try {
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('waiting'),
		)
		setNetwork('paseo')
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('active'),
		)
		expect(apiQuery).toHaveBeenCalledTimes(1)
		setNetwork('kusama')
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('waiting'),
		)
		expect(apiQuery.mock.lastCall?.[0].variables).toEqual({
			network: 'kusama',
			who: 'stash',
		})
		setPlugins([])
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('active'),
		)
	} finally {
		subscription.unsubscribe()
	}
})

test('a queued request retains the global source and network captured by its cache key', async () => {
	const input = config(true)
	const options = nominationStatusOptions(input, 'stash')
	setNetwork('kusama')
	setPlugins([])
	apiQuery.mockResolvedValue(apiResult('active'))
	expect(await createClient().fetchQuery(options)).toBe('active')
	expect(apiQuery.mock.lastCall?.[0].variables.network).toBe('polkadot')
	expect(getNetwork()).toBe('kusama')
	expect(input.node.query.nominatorsMulti).not.toHaveBeenCalled()
})

test.each([true, false])(
	'nomination dependencies refresh within an era and equal values share results (API: %s)',
	async (api) => {
		const input = config(api)
		const client = createClient()
		apiQuery.mockResolvedValue(apiResult('active'))
		const options = (target: string) =>
			nominationStatusOptions(input, 'stash', {
				dependencies: [{ targets: [target], submittedIn: 100 }],
			})
		const observer = new QueryObserver(client, options('validator'))
		observers.push(observer)
		observer.subscribe(() => {})
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('active'),
		)

		// A recreated nominations object must not cause another request.
		observer.setOptions(options('validator'))
		expect(await client.fetchQuery(options('validator'))).toBe('active')
		const read = api ? apiQuery : input.node.query.nominatorsMulti
		expect(read).toHaveBeenCalledTimes(1)

		apiQuery.mockResolvedValue(apiResult('waiting'))
		input.node.query.nominatorsMulti.mockResolvedValue([
			{ targets: ['new-validator'], submittedIn: 100, suppressed: false },
		])
		input.node.query.erasStakersOverview.mockResolvedValue(undefined)
		observer.setOptions(options('new-validator'))
		expect(observer.getCurrentResult().data).toBeUndefined()
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().data).toBe('waiting'),
		)
		expect(read).toHaveBeenCalledTimes(2)
		if (api) expectNoNodeQueries(input.node)
		else expect(apiQuery).not.toHaveBeenCalled()
	},
)

test.each([true, false])(
	'the hook exposes an explicit refetch (API: %s)',
	async (api) => {
		const input = config(api)
		const client = createClient()
		const options = nominationStatusOptions(input, 'stash')
		client.setQueryData(options.queryKey, 'active')
		let result!: ReturnType<typeof useNominationStatus>
		const Consumer = () => {
			result = useNominationStatus('stash')
			return null
		}
		renderToStaticMarkup(
			createElement(
				DataGateContext.Provider,
				{ value: input },
				createElement(QueryClientProvider, { client }, createElement(Consumer)),
			),
		)
		expect(result.status).toBe('active')
		apiQuery.mockResolvedValue(apiResult('waiting'))
		input.node.query.nominatorsMulti.mockResolvedValue([undefined])
		expect((await result.refetch()).data).toBe('waiting')
		expect(client.getQueryData(options.queryKey)).toBe('waiting')
		if (api) expectNoNodeQueries(input.node)
		else expect(apiQuery).not.toHaveBeenCalled()
	},
)

test('changing dependencies cancels an unfinished node query before it fetches pages', async () => {
	const input = config()
	const pending = deferred<typeof overview>()
	input.node.query.erasStakersOverview.mockReturnValueOnce(pending.promise)
	const observer = observe(input)
	await vi.waitFor(() =>
		expect(input.node.query.erasStakersOverview).toHaveBeenCalledTimes(1),
	)
	input.node.query.erasStakersOverview.mockResolvedValue(undefined)
	input.node.query.nominatorsMulti.mockResolvedValue([
		{ targets: ['new-validator'], submittedIn: 100, suppressed: false },
	])
	observer.setOptions(
		nominationStatusOptions(input, 'stash', {
			dependencies: ['new-validator'],
		}),
	)
	await vi.waitFor(() =>
		expect(observer.getCurrentResult().data).toBe('waiting'),
	)
	pending.resolve(overview)
	await pending.promise
	await Promise.resolve()
	expect(input.node.query.erasStakersPagedEntries).not.toHaveBeenCalled()
	expect(observer.getCurrentResult().data).toBe('waiting')
})

test('refresh cadence follows only the selected fetch source', () => {
	const definition: DataPointConfig<number> = {
		key: ['refresh-test'],
		node: { queryFn: async () => 1 },
		stakingApi: { queryFn: async () => 2, refreshInterval: 60_000 },
	}
	config(false)
	expect(dataPointOptions(definition).refetchInterval).toBe(false)
	expect(dataPointOptions(definition).staleTime).toBe(Infinity)
	config(true)
	expect(dataPointOptions(definition).refetchInterval).toBe(60_000)
	expect(dataPointOptions(definition).staleTime).toBe(60_000)
})

test('the public data-point hook masks disabled snapshots and exposes refetch without query internals', async () => {
	const input = config(true)
	const client = createClient()
	const readNode = vi.fn(async () => 1)
	const readApi = vi.fn(async () => 2)
	const definition: DataPointConfig<number> = {
		key: ['public-hook'],
		node: { queryFn: readNode },
		stakingApi: { queryFn: readApi },
	}
	const options = dataPointOptions(definition)
	client.setQueryData(options.queryKey, 10)
	let result!: ReturnType<typeof useDataPoint<number>>
	const Consumer = () => {
		result = useDataPoint(definition)
		return null
	}
	const render = () =>
		renderToStaticMarkup(
			createElement(
				DataGateContext.Provider,
				{ value: input },
				createElement(QueryClientProvider, { client }, createElement(Consumer)),
			),
		)
	render()
	expect(result.data).toBe(10)
	expect(result.loading).toBe(false)
	expect((await result.refetch()).data).toBe(2)
	expect(readNode).not.toHaveBeenCalled()
	definition.stakingApi.enabled = false
	render()
	expect(result.data).toBeUndefined()
	expect(result.loading).toBe(true)
})
