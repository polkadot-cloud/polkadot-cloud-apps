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
import { useEraNominatorCount } from '../../data-gate/src/eraNominatorCount'
import { useHasEraBacking } from '../../data-gate/src/hasEraBacking'
import {
	nominationStatusOptions,
	useNominationStatus,
} from '../../data-gate/src/nominationStatus'
import { useNomineeStatuses } from '../../data-gate/src/nomineeStatuses'
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
	setPlugins(['staking_api'])
	expect(pluginEnabled('staking_api')).toBe(true)
	setNetwork('paseo')
	expect(pluginEnabled('staking_api')).toBe(false)
	expect(getPlugins()).toEqual([])
	expect(getAvailablePlugins().activePlugins).toEqual([])
	expect(JSON.parse(storage.get('plugins')!)).toEqual(['staking_api'])
	setNetwork('kusama')
	expect(pluginEnabled('staking_api')).toBe(true)
	setPlugins([])
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

const eraConsumers = [
	{ name: 'count', read: () => useEraNominatorCount(), expected: 1 },
	{ name: 'backing', read: () => useHasEraBacking('stash'), expected: true },
	{
		name: 'nominees',
		read: () => useNomineeStatuses('stash', ['validator']),
		expected: [{ address: 'validator', status: 'active', activeBacking: '10' }],
	},
]

test.each(
	eraConsumers.flatMap((consumer) =>
		(['overviews', 'exposures'] as const).map((failure) => ({
			...consumer,
			failure,
		})),
	),
)(
	'$name public refetch retries failed node $failure',
	async ({ read, expected, failure }) => {
		const input = config()
		const client = createClient()
		client.setDefaultOptions({
			// Each server render remounts the hooks; leave recovery to the public refetch below.
			queries: { retry: false, retryOnMount: false, gcTime: Infinity },
		})
		input.node.query.erasStakersOverviewEntries.mockResolvedValue([
			[[100, 'validator'], overview],
		])
		const failingRead =
			failure === 'overviews'
				? input.node.query.erasStakersOverviewEntries
				: input.node.query.erasStakersPagedEntries
		failingRead.mockRejectedValueOnce(new Error('offline'))
		let result!: ReturnType<typeof read>
		const Consumer = () => {
			result = read()
			return null
		}
		const render = () =>
			renderToStaticMarkup(
				createElement(
					DataGateContext.Provider,
					{ value: input },
					createElement(
						QueryClientProvider,
						{ client },
						createElement(Consumer),
					),
				),
			)
		render()
		// Server rendering does not start queries. Run the observed snapshot to reproduce an
		// initial transport failure, then recover exclusively through the exported hook.
		const overviews = client.getQueryCache().find({
			queryKey: ['validator-overviews', 'polkadot', 100],
		})!
		if (failure === 'overviews') {
			await expect(overviews.fetch()).rejects.toThrow('offline')
		} else {
			await overviews.fetch()
			render()
			const exposures = client.getQueryCache().find({
				queryKey: ['era-exposures', 'polkadot', 100],
			})!
			await expect(exposures.fetch()).rejects.toThrow('offline')
		}
		render()
		expect(result.error?.message).toBe('offline')
		expect(result.data).toBeUndefined()
		expect(result.loading).toBe(false)
		expect(failingRead).toHaveBeenCalledTimes(1)
		const recovered = await result.refetch()
		expect(recovered.data).toEqual(expected)
		expect(recovered.error).toBeNull()
		expect(failingRead).toHaveBeenCalledTimes(2)
		expect(input.node.query.erasStakersOverviewEntries).toHaveBeenCalledTimes(
			failure === 'overviews' ? 2 : 1,
		)
		expect(input.node.query.erasStakersPagedEntries).toHaveBeenCalledTimes(
			failure === 'exposures' ? 2 : 1,
		)
		render()
		expect(result.data).toEqual(expected)
		expect(result.error).toBeNull()
		expect(result.loading).toBe(false)
		expect(apiQuery).not.toHaveBeenCalled()
	},
)

test('node validator entries are lazy and shared across consumers, with separate era and network caches', async () => {
	const { nodeValidatorEntriesOptions } = await import(
		'../../data-gate/src/validatorEntries/node'
	)
	const input = config()
	input.node.query.validatorEntries.mockResolvedValue([
		['validator', { commission: 25_000_000, blocked: false }],
	])
	const client = createClient()
	const observer = new QueryObserver(
		client,
		nodeValidatorEntriesOptions(input.node, 'polkadot', 100, false),
	)
	observers.push(observer)
	observer.subscribe(() => {})
	expect(input.node.query.validatorEntries).not.toHaveBeenCalled()
	const options = nodeValidatorEntriesOptions(input.node, 'polkadot', 100, true)
	const results = await Promise.all([
		client.fetchQuery(options),
		client.fetchQuery(options),
	])
	expect(results[0]).toEqual([
		{ address: 'validator', prefs: { commission: 2.5, blocked: false } },
	])
	expect(results[1]).toEqual(results[0])
	await client.fetchQuery(options)
	expect(input.node.query.validatorEntries).toHaveBeenCalledTimes(1)
	await client.fetchQuery(
		nodeValidatorEntriesOptions(input.node, 'polkadot', 101, true),
	)
	await client.fetchQuery(
		nodeValidatorEntriesOptions(input.node, 'kusama', 100, true),
	)
	expect(input.node.query.validatorEntries).toHaveBeenCalledTimes(3)
})

test.each(['polkadot', 'kusama'] as const)(
	'API records on %s require no node readiness, handle missing validators, and never fall back to entries',
	async (network) => {
		const { useValidatorRecords } = await import(
			'../../data-gate/src/validatorEntries'
		)
		const input = config(true)
		setNetwork(network)
		input.ready = false
		input.era = 0
		const client = createClient()
		let result!: ReturnType<typeof useValidatorRecords>
		const Consumer = () => {
			result = useValidatorRecords(['missing', 'validator'])
			return null
		}
		const render = () =>
			renderToStaticMarkup(
				createElement(
					DataGateContext.Provider,
					{ value: input },
					createElement(
						QueryClientProvider,
						{ client },
						createElement(Consumer),
					),
				),
			)
		render()
		apiQuery.mockResolvedValue({
			data: {
				validatorRecords: [
					{
						address: 'missing',
						registered: false,
						prefs: null,
						identity: null,
					},
					{
						address: 'validator',
						registered: true,
						prefs: { commission: 3, blocked: false },
						identity: {
							display: 'Alice',
							superDisplay: null,
							superValue: null,
						},
					},
				],
			},
		})
		expect((await result.refetch()).data?.prefs).toEqual({
			missing: null,
			validator: { commission: 3, blocked: false },
		})
		expect(apiQuery.mock.lastCall?.[0].variables).toEqual({
			network,
			addresses: ['missing', 'validator'],
		})
		render()
		expect(result.entries).toBeUndefined()
		expect(result.data?.identities.validator?.info.display.value).toBe('Alice')
		apiQuery.mockRejectedValue(new Error('offline'))
		expect((await result.refetch()).error?.message).toBe('offline')
		expectNoNodeQueries(input.node)
	},
)

test('validator records with all-node demand still resolve explicitly requested unregistered addresses', async () => {
	const { useValidatorRecords } = await import(
		'../../data-gate/src/validatorEntries'
	)
	const input = config()
	input.node.query.validatorEntries.mockResolvedValue([
		['validator', { commission: 0, blocked: false }],
	])
	input.node.query.identityOfMulti.mockResolvedValue([])
	input.node.query.superOfMulti.mockResolvedValue([])
	const client = createClient()
	let result!: ReturnType<typeof useValidatorRecords>
	const Consumer = () => {
		result = useValidatorRecords(['missing'], true)
		return null
	}
	renderToStaticMarkup(
		createElement(
			DataGateContext.Provider,
			{ value: input },
			createElement(QueryClientProvider, { client }, createElement(Consumer)),
		),
	)
	expect((await result.refetch()).data?.prefs).toEqual({
		missing: null,
		validator: { commission: 0, blocked: false },
	})
	expect(input.node.query.validatorEntries).toHaveBeenCalledTimes(1)
})

test('a captured entries query cannot start a scan after the API plugin is enabled', async () => {
	const { nodeValidatorEntriesOptions } = await import(
		'../../data-gate/src/validatorEntries/node'
	)
	const input = config()
	const captured = nodeValidatorEntriesOptions(
		input.node,
		'polkadot',
		100,
		true,
	)
	setPlugins(['staking_api'])
	await expect(createClient().fetchQuery(captured)).rejects.toThrow(
		'disabled in API mode',
	)
	expect(input.node.query.validatorEntries).not.toHaveBeenCalled()
})

test('mounting items from a loaded node list keeps the shared records query and loading state stable', async () => {
	const { useValidatorRecords } = await import(
		'../../data-gate/src/validatorEntries'
	)
	const input = config()
	input.node.query.validatorEntries.mockResolvedValue([
		['validator', { commission: 0, blocked: false }],
	])
	input.node.query.identityOfMulti.mockResolvedValue([])
	input.node.query.superOfMulti.mockResolvedValue([])
	const client = createClient()
	let addresses: string[] = []
	let result!: ReturnType<typeof useValidatorRecords>
	const Consumer = () => {
		result = useValidatorRecords(addresses, true)
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
	await result.refetch()
	render()
	expect(result.loading).toBe(false)
	addresses = ['validator']
	render()
	expect(result.loading).toBe(false)
	expect(
		client.getQueryCache().findAll({ queryKey: ['validator-records'] }),
	).toHaveLength(1)
	expect(input.node.query.validatorEntries).toHaveBeenCalledTimes(1)
	expect(input.node.query.identityOfMulti).toHaveBeenCalledTimes(1)
})

const renderValidatorPrefs = async (
	input: DataGateState,
	client: QueryClient,
	addresses: string[],
) => {
	const { useValidatorPrefs } = await import(
		'../../data-gate/src/validatorPrefs'
	)
	let result!: ReturnType<typeof useValidatorPrefs>
	const Consumer = () => {
		result = useValidatorPrefs(addresses)
		return null
	}
	renderToStaticMarkup(
		createElement(
			DataGateContext.Provider,
			{ value: input },
			createElement(QueryClientProvider, { client }, createElement(Consumer)),
		),
	)
	return result
}

test.each([true, false])(
	'validator preferences share concurrent requests for the same address set (API: %s)',
	async (api) => {
		const input = config(api)
		const client = createClient()
		input.node.query.validatorsMulti.mockResolvedValue([
			undefined,
			{ commission: 25_000_000, blocked: true },
		])
		apiQuery.mockResolvedValue({
			data: {
				validatorRecords: [
					{
						address: 'missing',
						registered: false,
						prefs: null,
						identity: null,
					},
					{
						address: 'validator',
						registered: true,
						prefs: { commission: 2.5, blocked: true },
						identity: null,
					},
				],
			},
		})
		const first = await renderValidatorPrefs(input, client, [
			'validator',
			'missing',
		])
		const second = await renderValidatorPrefs(input, client, [
			'missing',
			'validator',
			'validator',
		])
		const results = await Promise.all([first.refetch(), second.refetch()])
		const expected = {
			missing: null,
			validator: { commission: 2.5, blocked: true },
		}
		expect(results.map(({ data }) => data)).toEqual([expected, expected])
		expect(
			(await renderValidatorPrefs(input, client, ['validator', 'missing']))
				.data,
		).toEqual(expected)
		expect(
			client.getQueryCache().findAll({
				queryKey: [api ? 'validator-records' : 'validator-prefs'],
			}),
		).toHaveLength(1)
		if (api) {
			expect(apiQuery).toHaveBeenCalledTimes(1)
			expect(apiQuery.mock.lastCall?.[0].variables.addresses).toEqual([
				'missing',
				'validator',
			])
			expectNoNodeQueries(input.node)
		} else {
			expect(input.node.query.validatorsMulti).toHaveBeenCalledExactlyOnceWith([
				'missing',
				'validator',
			])
			expect(apiQuery).not.toHaveBeenCalled()
		}
		expect(input.node.query.validatorEntries).not.toHaveBeenCalled()
	},
)

test('API preferences work before node readiness and errors never fetch node preferences', async () => {
	const input = { ...config(true), ready: false, era: 0 }
	const client = createClient()
	await renderValidatorPrefs(input, client, ['validator'])
	apiQuery.mockRejectedValue(new Error('offline'))
	const query = client
		.getQueryCache()
		.findAll({ queryKey: ['validator-records'] })[0]
	await expect(query.fetch()).rejects.toThrow('offline')
	expect(apiQuery).toHaveBeenCalledTimes(1)
	expectNoNodeQueries(input.node)
})

test.each([true, false])(
	'empty favorites disable both preference sources (API: %s)',
	async (api) => {
		const input = config(api)
		const client = createClient()
		const result = await renderValidatorPrefs(input, client, [])
		expect(result.data).toBeUndefined()
		expect(result.loading).toBe(false)
		const query = client.getQueryCache().findAll({
			queryKey: [api ? 'validator-records' : 'validator-prefs'],
		})[0]
		expect(query.options.queryFn).toBeTypeOf('symbol')
		expectNoNodeQueries(input.node)
		expect(apiQuery).not.toHaveBeenCalled()
	},
)

test('node preferences wait for readiness and then resolve without a full entries scan', async () => {
	const input = { ...config(), ready: false }
	const client = createClient()
	expect(
		(await renderValidatorPrefs(input, client, ['validator'])).loading,
	).toBe(true)
	expect(
		client.getQueryCache().findAll({ queryKey: ['validator-prefs'] })[0].options
			.queryFn,
	).toBeTypeOf('symbol')
	expectNoNodeQueries(input.node)
	input.ready = true
	input.node.query.validatorsMulti.mockResolvedValue([
		{ commission: 0, blocked: false },
	])
	const result = await renderValidatorPrefs(input, client, ['validator'])
	expect((await result.refetch()).data).toEqual({
		validator: { commission: 0, blocked: false },
	})
	expect(input.node.query.validatorEntries).not.toHaveBeenCalled()
})

test('late preference results stay isolated after changing network, source, or favorites', async () => {
	const input = config()
	const client = createClient()
	const pending =
		deferred<
			Awaited<ReturnType<ServiceInterface['query']['validatorsMulti']>>
		>()
	input.node.query.validatorsMulti.mockReturnValue(pending.promise)
	const old = await renderValidatorPrefs(input, client, ['old-validator'])
	const oldRequest = old.refetch()
	setNetwork('kusama')
	setPlugins(['staking_api'])
	apiQuery.mockResolvedValue({
		data: {
			validatorRecords: [
				{
					address: 'new-validator',
					registered: true,
					prefs: { commission: 5, blocked: false },
					identity: null,
				},
			],
		},
	})
	const current = await renderValidatorPrefs(input, client, ['new-validator'])
	expect(current.data).toBeUndefined()
	await current.refetch()
	pending.resolve([{ commission: 0, blocked: true }])
	await oldRequest
	expect(
		(await renderValidatorPrefs(input, client, ['new-validator'])).data,
	).toEqual({ 'new-validator': { commission: 5, blocked: false } })
	expect(apiQuery.mock.lastCall?.[0].variables.network).toBe('kusama')
	expect(input.node.query.validatorsMulti).toHaveBeenCalledTimes(1)
	expect(input.node.query.validatorEntries).not.toHaveBeenCalled()
})

test.each([true, false])(
	'API records and preferences share requests, refreshes and errors (preferences first: %s)',
	async (preferencesFirst) => {
		const { useValidatorRecords } = await import(
			'../../data-gate/src/validatorEntries'
		)
		const { useValidatorPrefs } = await import(
			'../../data-gate/src/validatorPrefs'
		)
		const input = { ...config(true), ready: false, era: 0 }
		const client = createClient()
		let records!: ReturnType<typeof useValidatorRecords>
		let prefs!: ReturnType<typeof useValidatorPrefs>
		const Records = () => {
			records = useValidatorRecords(['validator', 'missing'])
			return null
		}
		const Prefs = () => {
			prefs = useValidatorPrefs(['missing', 'validator', 'validator'])
			return null
		}
		const render = () =>
			renderToStaticMarkup(
				createElement(
					DataGateContext.Provider,
					{ value: input },
					createElement(
						QueryClientProvider,
						{ client },
						createElement(preferencesFirst ? Prefs : Records),
						createElement(preferencesFirst ? Records : Prefs),
					),
				),
			)
		const response = (commission: number, display: string) => ({
			data: {
				validatorRecords: [
					{
						address: 'missing',
						registered: false,
						prefs: null,
						identity: null,
					},
					{
						address: 'validator',
						registered: true,
						prefs: { commission, blocked: false },
						identity: { display, superDisplay: null, superValue: null },
					},
				],
			},
		})
		apiQuery.mockResolvedValue(response(3, 'Alice'))
		render()
		await Promise.all(
			preferencesFirst
				? [prefs.refetch(), records.refetch()]
				: [records.refetch(), prefs.refetch()],
		)
		render()
		expect(apiQuery).toHaveBeenCalledTimes(1)
		expect(prefs.data).toEqual({
			missing: null,
			validator: { commission: 3, blocked: false },
		})
		expect(records.data?.prefs).toEqual(prefs.data)
		expect(records.data?.identities.validator?.info.display.value).toBe('Alice')
		expect(
			client.getQueryCache().findAll({ queryKey: ['validator-records'] }),
		).toHaveLength(1)
		expect(
			client.getQueryCache().findAll({ queryKey: ['validator-prefs'] }),
		).toHaveLength(0)

		apiQuery.mockResolvedValue(response(7, 'Bob'))
		expect((await prefs.refetch()).data?.validator?.commission).toBe(7)
		render()
		expect(records.data?.identities.validator?.info.display.value).toBe('Bob')
		expect(records.data?.prefs).toEqual(prefs.data)
		expect(apiQuery).toHaveBeenCalledTimes(2)

		apiQuery.mockRejectedValue(new Error('offline'))
		expect((await records.refetch()).error?.message).toBe('offline')
		render()
		expect(prefs.error?.message).toBe('offline')
		expect(prefs.data?.validator?.commission).toBe(7)
		expect(records.data?.identities.validator?.info.display.value).toBe('Bob')
		expectNoNodeQueries(input.node)
	},
)
