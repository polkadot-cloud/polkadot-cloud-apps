// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	type FetchQueryOptions,
	QueryClient,
	QueryObserver,
} from '@tanstack/react-query'
import type { ErasStakersOverviewEntries, ErasStakersPagedEntries } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useEraNominatorCount } from '../../data-gate/src/eraNominatorCount'
import { useNodeEraStakers } from '../../data-gate/src/eraStakers/node'
import { useHasEraBacking } from '../../data-gate/src/hasEraBacking'
import { useNomineeStatuses } from '../../data-gate/src/nomineeStatuses'
import { fetchEraNomineeStatuses } from '../../data-gate/src/nomineeStatuses/stakingApi'
import { useValidatorOverviews } from '../../data-gate/src/validatorOverviews'
import { useActiveValidatorCount } from '../../data-gate/src/validatorOverviews/count'
import { useValidatorRewardRates } from '../../data-gate/src/validatorRewardRates'
import { fetchGetNomineesStatus } from '../../plugin-staking-api/src/queries/getNomineesStatus'

const {
	state,
	exposureReads,
	overviewEntries,
	overviewQuery,
	rewardPoints,
	payout,
	apiQuery,
	queries,
} = vi.hoisted(() => ({
	state: {
		api: true,
		ready: true,
		network: 'polkadot',
		era: 100,
		client: null as QueryClient | null,
		exposuresStatus: 'success',
	},
	exposureReads: vi.fn(),
	overviewEntries: vi.fn(),
	rewardPoints: vi.fn(),
	payout: vi.fn(),
	overviewQuery: vi.fn(),
	apiQuery: vi.fn(),
	queries: [] as (FetchQueryOptions & {
		enabled: boolean
		refetchInterval: number | false
	})[],
}))

vi.mock('@tanstack/react-query', async (original) => ({
	...(await original<typeof import('@tanstack/react-query')>()),
	useQueryClient: () => state.client!,
	// Capture real gate options and execute them through a real QueryClient below. This keeps the
	// tests independent of a browser while exercising transports, source selection and cache keys.
	useQuery: (options: (typeof queries)[number]) => {
		queries.push(options)
		const query = state.client!.getQueryState(options.queryKey)
		return {
			data: query?.data,
			error: query?.error ?? null,
			isPending: !query || query.status === 'pending',
			status: query?.status ?? 'pending',
			isLoading: options.enabled && (!query || query.status === 'pending'),
		}
	},
}))
vi.mock('../../data-gate/src/provider', () => ({
	useDataGate: () => ({
		era: state.era,
		ready: state.ready,
		node: {
			query: {
				erasStakersOverview: overviewQuery,
				erasStakersOverviewEntries: overviewEntries,
				erasStakersPagedEntries: exposureReads,
				erasRewardPoints: rewardPoints,
				erasValidatorReward: payout,
			},
		},
	}),
}))
vi.mock('../../global-bus/src/index', () => ({
	getNetwork: () => state.network,
	pluginEnabled: () => state.api,
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({
		isReady: true,
		activeEra: { index: state.era },
		serviceApi: { query: { erasStakersOverview: overviewQuery } },
	}),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: state.network }),
}))
vi.mock('../../hooks/src/useErasPerDay', () => ({
	useErasPerDay: () => ({ erasPerDay: 4 }),
}))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({ pluginEnabled: () => state.api }),
}))
vi.mock('../../plugin-staking-api/src/Client', () => ({
	client: { query: apiQuery },
}))

beforeEach(() => {
	state.api = true
	state.ready = true
	state.network = 'polkadot'
	state.era = 100
	state.exposuresStatus = 'success'
	state.client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	})
	queries.length = 0
	vi.clearAllMocks()

	overviewEntries.mockResolvedValue([
		[
			[100, 'old-target'],
			{ own: 0n, total: 90071992547409931n, nominatorCount: 2, pageCount: 1 },
		],
	])
	exposureReads.mockResolvedValue([
		[
			[100, 'old-target', 0],
			{
				pageTotal: 90071992547409931n,
				others: [
					{ who: 'stash', value: 90071992547409930n },
					{ who: 'another-stash', value: 1n },
				],
			},
		],
	])
	rewardPoints.mockResolvedValue({ total: 10, individual: [] })
	payout.mockResolvedValue(100n)
})
afterEach(() => {
	state.client!.clear()
})
const latest = () => queries.at(-1)!
const fetchLatest = () => state.client!.fetchQuery(latest())
const loadExposures = async () => {
	useNodeEraStakers(true)
	await state.client!.fetchQuery(queries.at(-2)!)
	useNodeEraStakers(true)
	await fetchLatest()
}

const apiOverview = {
	validator: 'validator',
	own: '90071992547409930',
	total: '90071992547409931',
	nominatorCount: 1,
	pageCount: 1,
}

test.each(['polkadot', 'kusama'])(
	'API overviews on %s avoid node reads, preserve precision, and share requests before node readiness',
	async (network) => {
		state.network = network
		state.ready = false
		apiQuery.mockResolvedValue({
			data: { eraValidatorOverviews: [apiOverview] },
		})
		useValidatorOverviews(['validator'])
		const options = latest()
		expect(options.enabled).toBe(true)
		expect(options.refetchInterval).toBe(60_000)
		const first = fetchLatest()
		useValidatorOverviews(['validator'])
		expect(await fetchLatest()).toEqual(await first)
		expect(useValidatorOverviews(['validator']).data).toEqual([
			[
				[100, 'validator'],
				{
					own: 90071992547409930n,
					total: 90071992547409931n,
					nominatorCount: 1,
					pageCount: 1,
				},
			],
		])
		expect(apiQuery).toHaveBeenCalledTimes(1)
		const request = apiQuery.mock.calls[0][0]
		expect(request.variables).toEqual({
			network,
			era: 100,
			addresses: ['validator'],
		})
		expect(request.fetchPolicy).toBe('no-cache')
		expect(request.context.queryDeduplication).toBe(false)
		expect(request.context.fetchOptions.signal).toBeInstanceOf(AbortSignal)
		expect(overviewEntries).not.toHaveBeenCalled()
		expect(exposureReads).not.toHaveBeenCalled()
	},
)

test('overview API errors do not fall back to node and a refresh can recover', async () => {
	apiQuery.mockRejectedValueOnce(new Error('offline'))
	useValidatorOverviews(['validator'])
	await expect(fetchLatest()).rejects.toThrow('offline')
	expect(useValidatorOverviews(['validator']).error?.message).toBe('offline')
	expect(useValidatorOverviews(['validator']).loading).toBe(false)
	apiQuery.mockResolvedValueOnce({ data: { eraValidatorOverviews: [] } })
	expect(await fetchLatest()).toEqual([])
	expect(useValidatorOverviews(['validator']).data).toEqual([])
	expect(overviewEntries).not.toHaveBeenCalled()
	expect(exposureReads).not.toHaveBeenCalled()
})

test('empty API overviews refresh as indexing progresses within the same era', async () => {
	apiQuery.mockResolvedValueOnce({ data: { eraValidatorOverviews: [] } })
	useValidatorOverviews(['validator'])
	const options = latest()
	expect(await fetchLatest()).toEqual([])
	apiQuery.mockResolvedValueOnce({
		data: { eraValidatorOverviews: [apiOverview] },
	})
	await state.client!.invalidateQueries({ queryKey: options.queryKey })
	expect(await fetchLatest()).toHaveLength(1)
	expect(options.refetchInterval).toBe(60_000)
})

test('node overview readers and exposure consumers share one raw scan', async () => {
	state.api = false
	useValidatorOverviews(['validator'])
	expect(await fetchLatest()).toHaveLength(1)
	expect(exposureReads).not.toHaveBeenCalled()
	await loadExposures()
	expect(overviewEntries.mock.calls).toEqual([[100]])
	expect(exposureReads.mock.calls).toEqual([[100]])
	expect(apiQuery).not.toHaveBeenCalled()
})

test('switching overview source aborts the API request and ignores its late result', async () => {
	let finish!: (value: unknown) => void
	apiQuery.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve
			}),
	)
	useValidatorOverviews(['validator'])
	const observer = new QueryObserver(state.client!, latest())
	const unsubscribe = observer.subscribe(() => {})
	try {
		await vi.waitFor(() => expect(apiQuery).toHaveBeenCalledTimes(1))
		const signal = apiQuery.mock.calls[0][0].context.fetchOptions.signal
		state.api = false
		useValidatorOverviews(['validator'])
		observer.setOptions(latest())
		expect(signal.aborted).toBe(true)
		await vi.waitFor(() =>
			expect(observer.getCurrentResult().status).toBe('success'),
		)
		finish({ data: { eraValidatorOverviews: [apiOverview] } })
		await Promise.resolve()
		expect(observer.getCurrentResult().data).toEqual(
			await overviewEntries.mock.results[0].value,
		)
		expect(overviewEntries.mock.calls).toEqual([[100]])
		expect(exposureReads).not.toHaveBeenCalled()
	} finally {
		unsubscribe()
	}
})

test('overview caches separate networks, eras, and sources and mask disabled data', async () => {
	apiQuery.mockResolvedValue({ data: { eraValidatorOverviews: [apiOverview] } })
	useValidatorOverviews(['validator'])
	const apiKey = latest().queryKey
	await fetchLatest()
	expect(useValidatorOverviews(['validator'], false).data).toBeUndefined()
	expect(useValidatorOverviews(['validator'], false).loading).toBe(false)
	expect(latest().enabled).toBe(false)
	state.era = 101
	expect(useValidatorOverviews(['validator']).data).toBeUndefined()
	expect(latest().queryKey).not.toEqual(apiKey)
	expect(await fetchLatest()).toMatchObject([[[101, 'validator'], {}]])
	state.network = 'kusama'
	expect(useValidatorOverviews(['validator']).data).toBeUndefined()
	await fetchLatest()
	expect(apiQuery.mock.lastCall![0].variables).toEqual({
		network: 'kusama',
		era: 101,
		addresses: ['validator'],
	})
	state.api = false
	expect(useValidatorOverviews(['validator']).data).toBeUndefined()
	await fetchLatest()
	expect(overviewEntries.mock.calls).toEqual([[101]])
	state.ready = false
	expect(useValidatorOverviews(['validator']).data).toBeUndefined()
	expect(latest().enabled).toBe(false)
	state.api = true
	state.era = 0
	useValidatorOverviews(['validator'])
	expect(latest().enabled).toBe(false)
})

test.each(
	[
		[{ ...apiOverview, validator: 'unrequested' }],
		[{ ...apiOverview, own: '-1' }],
		[{ ...apiOverview, total: '1.5' }],
		[{ ...apiOverview, total: '' }],
		[{ ...apiOverview, nominatorCount: -1 }],
		[{ ...apiOverview, pageCount: -1 }],
		[apiOverview, apiOverview],
	].map((overviews) => ({ overviews })),
)(
	'malformed API overview snapshots remain errors: $overviews',
	async ({ overviews }) => {
		apiQuery.mockResolvedValueOnce({
			data: { eraValidatorOverviews: overviews },
		})
		useValidatorOverviews(['validator'])
		await expect(fetchLatest()).rejects.toThrow('invalid validator overviews')
		expect(useValidatorOverviews(['validator']).data).toBeUndefined()
		expect(overviewEntries).not.toHaveBeenCalled()
	},
)

test.each(['polkadot', 'kusama'])(
	'API count on %s refreshes indexed counts without node exposures',
	async (network) => {
		state.network = network
		apiQuery.mockResolvedValueOnce({ data: { eraActiveNominatorCount: 0 } })
		useEraNominatorCount()
		const options = latest()
		expect(await fetchLatest()).toBe(0)
		expect(useEraNominatorCount().loading).toBe(false)
		expect(options.refetchInterval).toBe(60_000)
		apiQuery.mockResolvedValueOnce({ data: { eraActiveNominatorCount: 2 } })
		await state.client!.invalidateQueries({ queryKey: options.queryKey })
		expect(await fetchLatest()).toBe(2)
		expect(useEraNominatorCount().loading).toBe(false)
		expect(options.refetchInterval).toBe(60_000)
		expect(exposureReads).not.toHaveBeenCalled()
		expect(overviewEntries).not.toHaveBeenCalled()
	},
)

test('nominees share canonical target keys and preserve backing precision', async () => {
	apiQuery.mockResolvedValueOnce({
		data: {
			getNomineesStatus: {
				statuses: [
					{ address: 'new-target', status: 'invalid', activeBacking: '0' },
					{
						address: 'old-target',
						status: 'active',
						activeBacking: '90071992547409930',
					},
				],
			},
		},
	})
	useNomineeStatuses('stash', ['old-target', 'new-target'])
	expect(latest().enabled).toBe(true)
	const key = latest().queryKey
	expect(await fetchLatest()).toEqual([
		{ address: 'new-target', status: 'waiting', activeBacking: '0' },
		{
			address: 'old-target',
			status: 'active',
			activeBacking: '90071992547409930',
		},
	])
	useNomineeStatuses('stash', ['new-target', 'old-target', 'old-target'])
	expect(latest().queryKey).toEqual(key)
	await fetchLatest()
	expect(apiQuery).toHaveBeenCalledTimes(1)
	expect(exposureReads).not.toHaveBeenCalled()
	expect(overviewEntries).not.toHaveBeenCalled()
})

test('API failures remain errors and do not acquire node exposures', async () => {
	apiQuery.mockRejectedValueOnce(new Error('offline'))
	useEraNominatorCount()
	await expect(fetchLatest()).rejects.toThrow('offline')
	const result = useEraNominatorCount()
	expect(result.error?.message).toBe('offline')
	expect(result.loading).toBe(false)
	expect(result.data).toBeUndefined()
	expect(exposureReads).not.toHaveBeenCalled()
	expect(overviewEntries).not.toHaveBeenCalled()
})

test('node mode shares legacy exposures and keeps backing for previous nominees', async () => {
	state.api = false
	await loadExposures()
	useEraNominatorCount()
	expect(await fetchLatest()).toBe(2)
	useNomineeStatuses('stash', ['old-target', 'new-target'])
	expect(await fetchLatest()).toContainEqual({
		address: 'old-target',
		status: 'active',
		activeBacking: '90071992547409930',
	})
	useHasEraBacking('stash')
	expect(await fetchLatest()).toBe(true)
	expect(exposureReads.mock.calls).toEqual([[100]])
	expect(exposureReads).toHaveBeenCalledTimes(1)
	expect(apiQuery).not.toHaveBeenCalled()
})

test('independent data points share concurrent node scans and reuse the completed snapshot', async () => {
	state.api = false
	const consumers = [
		() => useEraNominatorCount(),
		() => useNomineeStatuses('stash', ['old-target']),
		() => useHasEraBacking('stash'),
		() => useNodeEraStakers(true),
	]
	const snapshotOptions = (consume: () => unknown) => {
		const start = queries.length
		consume()
		return queries.slice(start, start + 2)
	}

	// Start all consumers before any overview or exposure response has completed.
	const initial = consumers.map(snapshotOptions)
	await Promise.all(
		initial.map(([overviews]) => state.client!.fetchQuery(overviews)),
	)
	const ready = consumers.map(snapshotOptions)
	const snapshots = await Promise.all(
		ready.map(([, exposures]) => state.client!.fetchQuery(exposures)),
	)
	expect(snapshots.every((snapshot) => snapshot === snapshots[0])).toBe(true)
	expect(overviewEntries).toHaveBeenCalledTimes(1)
	expect(exposureReads).toHaveBeenCalledTimes(1)

	// Later consumers reuse both raw queries as well as deriving their own result.
	for (const consume of consumers) {
		await Promise.all(
			snapshotOptions(consume).map((options) =>
				state.client!.fetchQuery(options),
			),
		)
	}
	useEraNominatorCount()
	expect(await fetchLatest()).toBe(2)
	useNomineeStatuses('stash', ['old-target'])
	expect(await fetchLatest()).toEqual([
		{
			address: 'old-target',
			status: 'active',
			activeBacking: '90071992547409930',
		},
	])
	useHasEraBacking('stash')
	expect(await fetchLatest()).toBe(true)
	expect(overviewEntries).toHaveBeenCalledTimes(1)
	expect(exposureReads).toHaveBeenCalledTimes(1)
	expect(apiQuery).not.toHaveBeenCalled()
})

test('a full validator set uses one era scan and groups every exposure page by validator', async () => {
	const entries: ErasStakersOverviewEntries = Array.from(
		{ length: 600 },
		(_, i) => [
			[100, `validator-${i}`],
			{ own: 10n, total: 30n, nominatorCount: 2, pageCount: 2 },
		],
	)
	const pages: ErasStakersPagedEntries = [1, 0].flatMap((pageIndex) =>
		entries.map<ErasStakersPagedEntries[number]>(([[era, address]]) => [
			[era, address, pageIndex],
			{
				pageTotal: 10n,
				others: [{ who: `pool-${address}-${pageIndex}`, value: 10n }],
			},
		]),
	)
	entries.push([
		[100, 'self-only'],
		{ own: 10n, total: 10n, nominatorCount: 0, pageCount: 0 },
	])
	overviewEntries.mockResolvedValue(entries)
	exposureReads.mockResolvedValue(pages)
	await loadExposures()
	const snapshot = useNodeEraStakers(true).exposures!
	expect(snapshot).toHaveLength(601)
	for (let i = 0; i < 600; i++) {
		expect(snapshot[i]).toEqual({
			keys: ['100', `validator-${i}`],
			val: {
				own: '10',
				total: '30',
				others: [1, 0].map((pageIndex) => ({
					who: `pool-validator-${i}-${pageIndex}`,
					value: '10',
				})),
			},
		})
	}
	expect(snapshot[600].val.others).toEqual([])
	expect(exposureReads.mock.calls).toEqual([[100]])
})

test('incomplete era scans are not cached as successful exposure snapshots', async () => {
	exposureReads.mockResolvedValue([])
	await expect(loadExposures()).rejects.toThrow('Incomplete exposure pages')
	expect(useNodeEraStakers(true).exposuresStatus).toBe('error')
	expect(useNodeEraStakers(true).exposures).toBeUndefined()
})

test('empty overview snapshots do not scan exposure storage', async () => {
	overviewEntries.mockResolvedValue([])
	await loadExposures()
	expect(useNodeEraStakers(true).exposures).toEqual([])
	expect(exposureReads).not.toHaveBeenCalled()
})

test('switching exposure demand while a scan is pending keeps one request and updates all observers', async () => {
	useNodeEraStakers(false)
	await state.client!.fetchQuery(queries.at(-2)!)
	let finish!: (pages: ErasStakersPagedEntries) => void
	const pages = await exposureReads()
	exposureReads.mockClear()
	exposureReads.mockImplementation(
		() =>
			new Promise<ErasStakersPagedEntries>((resolve) => {
				finish = resolve
			}),
	)
	useNodeEraStakers(false)
	const provider = new QueryObserver(state.client!, latest())
	const unsubscribeProvider = provider.subscribe(() => {})
	const list = new QueryObserver(state.client!, latest())
	const unsubscribeList = list.subscribe(() => {})
	try {
		useNodeEraStakers(true)
		provider.setOptions(latest())
		await vi.waitFor(() => expect(exposureReads).toHaveBeenCalledTimes(1))
		useNodeEraStakers(false)
		provider.setOptions(latest())
		useNodeEraStakers(true)
		provider.setOptions(latest())
		finish(pages)
		await vi.waitFor(() =>
			expect(provider.getCurrentResult().status).toBe('success'),
		)
		expect(list.getCurrentResult().data).toBe(provider.getCurrentResult().data)
		useNodeEraStakers(false)
		provider.setOptions(latest())
		useNodeEraStakers(true)
		provider.setOptions(latest())
		expect(provider.getCurrentResult().isFetching).toBe(false)
		expect(exposureReads.mock.calls).toEqual([[100]])
	} finally {
		unsubscribeList()
		unsubscribeProvider()
	}
})

test('concurrent derived queries load one shared snapshot without preloading prerequisites', async () => {
	state.api = false
	const consumers = [
		() => useEraNominatorCount(),
		() => useHasEraBacking('stash'),
		() => useNomineeStatuses('stash', ['old-target']),
	]
	const results = await Promise.all(
		consumers.map((consume) => {
			consume()
			return fetchLatest()
		}),
	)
	expect(results).toEqual([
		2,
		true,
		[
			{
				address: 'old-target',
				status: 'active',
				activeBacking: '90071992547409930',
			},
		],
	])
	expect(overviewEntries).toHaveBeenCalledTimes(1)
	expect(exposureReads).toHaveBeenCalledTimes(1)
	expect(apiQuery).not.toHaveBeenCalled()
})

test('pending and failed node exposures stay unavailable and recover when the snapshot completes', async () => {
	state.api = false
	expect(useEraNominatorCount().loading).toBe(true)
	expect(latest().enabled).toBe(true)
	useNodeEraStakers(true)
	await state.client!.fetchQuery(queries.at(-2)!)
	useNodeEraStakers(true)
	const pages = latest()
	exposureReads.mockRejectedValueOnce(new Error('offline'))
	await expect(
		state.client!.fetchQuery({ ...pages, retry: false }),
	).rejects.toThrow('offline')
	expect(useEraNominatorCount().error).toBeInstanceOf(Error)
	await state.client!.fetchQuery(pages)
	useEraNominatorCount()
	expect(await fetchLatest()).toBe(2)
})

test('era, account, targets and source changes use distinct cache entries', () => {
	useNomineeStatuses('stash', ['old-target'])
	const first = latest().queryKey
	state.era++
	useNomineeStatuses('stash', ['old-target'])
	expect(latest().queryKey).not.toEqual(first)
	state.era--
	useNomineeStatuses('other-stash', ['old-target'])
	expect(latest().queryKey).not.toEqual(first)
	useNomineeStatuses('stash', ['new-target'])
	expect(latest().queryKey).not.toEqual(first)
	state.api = false
	useNomineeStatuses('stash', ['old-target'])
	expect(latest().queryKey).not.toEqual(first)
})

test('empty inputs do not request exposures or execute a query', () => {
	state.api = false
	useNomineeStatuses('stash', [])
	useHasEraBacking(null)
	expect(queries.every((query) => !query.enabled)).toBe(true)
	expect(exposureReads).not.toHaveBeenCalled()
	expect(overviewEntries).not.toHaveBeenCalled()
})

test('nominee plugin fetcher returns the raw response in one request', async () => {
	const addresses = ['validator']
	const data = {
		getNomineesStatus: {
			statuses: [
				{ address: 'validator', status: 'invalid', activeBacking: '0' },
			],
		},
	}
	apiQuery.mockResolvedValueOnce({ data })
	expect(
		await fetchGetNomineesStatus('polkadot', 100, 'stash', addresses),
	).toBe(data)
	expect(apiQuery).toHaveBeenCalledTimes(1)
	expect(apiQuery.mock.calls[0][0].variables).toEqual({
		network: 'polkadot',
		era: 100,
		who: 'stash',
		addresses,
	})
})

test('nominee API adapter chunks requests, forwards cancellation and rejects missing entries', async () => {
	const targets = Array.from({ length: 51 }, (_, i) => `validator-${i}`)
	apiQuery.mockImplementation(async ({ variables }) => ({
		data: {
			getNomineesStatus: {
				statuses: variables.addresses.map((address: string) => ({
					address,
					status: 'inactive',
					activeBacking: '0',
				})),
			},
		},
	}))
	const signal = new AbortController().signal
	expect(
		await fetchEraNomineeStatuses('polkadot', 100, 'stash', targets, signal),
	).toHaveLength(51)
	expect(
		apiQuery.mock.calls.map(([request]) => request.variables.addresses.length),
	).toEqual([50, 1])
	for (const [request] of apiQuery.mock.calls) {
		expect(request.context.fetchOptions.signal).toBe(signal)
		expect(request.context.queryDeduplication).toBe(false)
		expect(request.fetchPolicy).toBe('no-cache')
	}
	apiQuery.mockResolvedValueOnce({
		data: { getNomineesStatus: { statuses: [] } },
	})
	await expect(
		fetchEraNomineeStatuses('polkadot', 100, 'stash', ['missing'], signal),
	).rejects.toThrow('incomplete')
})

test('API pool activity queries the requested era without restricting backing to current targets', async () => {
	apiQuery.mockResolvedValueOnce({
		data: { getNomineesInEra: ['previous-target'] },
	})
	useHasEraBacking('stash')
	expect(await fetchLatest()).toBe(true)
	expect(apiQuery.mock.calls[0][0].variables).toEqual({
		network: 'polkadot',
		era: 100,
		who: 'stash',
	})
	expect(exposureReads).not.toHaveBeenCalled()
	expect(overviewEntries).not.toHaveBeenCalled()
})

test.each(['polkadot', 'kusama'])(
	'reward rates on %s use the API even when previous node reward data is cached',
	async (network) => {
		state.network = network
		apiQuery.mockResolvedValueOnce({
			data: {
				validatorAvgRewardRateBatch: [{ validator: 'validator', rate: 10 }],
			},
		})
		useValidatorRewardRates(['validator'], 4)
		expect(await fetchLatest()).toEqual({ validator: 10 })
		expect(overviewQuery).not.toHaveBeenCalled()
		expect(apiQuery.mock.calls[0][0].variables.chain).toBe(network)
		const firstKey = latest().queryKey
		state.network = network === 'kusama' ? 'polkadot' : 'kusama'
		useValidatorRewardRates(['validator'], 4)
		expect(latest().queryKey).not.toEqual(firstKey)
	},
)

test('disabled rate lists do not execute queries, and node mode retains its overview calculation', async () => {
	state.api = false
	useValidatorRewardRates(['validator'], 4, false)
	expect(latest().enabled).toBe(false)
	overviewQuery.mockResolvedValue({ total: 0n })
	useValidatorRewardRates(['validator'], 4)
	expect(await fetchLatest()).toEqual({ validator: 0 })
	expect(overviewQuery).toHaveBeenCalledWith(99, 'validator')
	expect(apiQuery).not.toHaveBeenCalled()
})

test.each([null, -1, 1.5, undefined])(
	'invalid count %s is an error, not a successful zero',
	async (count) => {
		apiQuery.mockResolvedValueOnce({ data: { eraActiveNominatorCount: count } })
		useEraNominatorCount()
		await expect(fetchLatest()).rejects.toThrow('invalid nominator count')
	},
)

test('node reward rates share payout and points across the validator batch', async () => {
	state.api = false
	overviewQuery.mockResolvedValue({ total: 1000n })
	rewardPoints.mockResolvedValue({
		total: 10,
		individual: [
			[{ address: () => 'first' }, 4],
			[{ address: () => 'second' }, 6],
		],
	})
	payout.mockResolvedValue(100n)
	useValidatorRewardRates(['first', 'second'], 4)
	const rates = (await fetchLatest()) as Record<string, number>
	expect(rates.first).toBeCloseTo(5840)
	expect(rates.second).toBeCloseTo(8760)
	expect(payout).toHaveBeenCalledTimes(1)
	expect(rewardPoints).toHaveBeenCalledTimes(1)
	expect(apiQuery).not.toHaveBeenCalled()
})

test('no API overview demand makes no transport request', async () => {
	expect(useValidatorOverviews().data).toEqual([])
	expect(useValidatorOverviews().loading).toBe(false)
	expect(latest().enabled).toBe(false)
	expect(apiQuery).not.toHaveBeenCalled()
	expect(overviewEntries).not.toHaveBeenCalled()
})

test('overview demand is canonical, bounded and isolated from other address sets', async () => {
	const addresses = Array.from({ length: 201 }, (_, i) => `validator-${i}`)
	apiQuery.mockImplementation(async ({ variables }) => ({
		data: {
			eraValidatorOverviews: variables.addresses.map((validator: string) => ({
				...apiOverview,
				validator,
			})),
		},
	}))
	useValidatorOverviews(addresses)
	const key = latest().queryKey
	expect(await fetchLatest()).toHaveLength(201)
	expect(
		apiQuery.mock.calls.map(([request]) => request.variables.addresses.length),
	).toEqual([100, 100, 1])
	useValidatorOverviews([...addresses].reverse().concat(addresses))
	expect(latest().queryKey).toEqual(key)
	await fetchLatest()
	expect(apiQuery).toHaveBeenCalledTimes(3)
	expect(useValidatorOverviews(['new-target']).data).toBeUndefined()
	expect(overviewEntries).not.toHaveBeenCalled()
})

test('validator statistics use a count without fetching overview records', async () => {
	apiQuery.mockResolvedValue({ data: { eraActiveValidatorCount: 600 } })
	useActiveValidatorCount()
	expect(await fetchLatest()).toBe(600)
	expect(apiQuery.mock.calls[0][0].variables).toEqual({
		network: 'polkadot',
		era: 100,
	})
	expect(overviewEntries).not.toHaveBeenCalled()
	state.api = false
	useActiveValidatorCount()
	expect(await fetchLatest()).toBe(1)
	useValidatorOverviews(['old-target'])
	await fetchLatest()
	expect(overviewEntries).toHaveBeenCalledTimes(1)
})

test.each([null, -1, 1.5, undefined])(
	'invalid validator count %s remains an error',
	async (count) => {
		apiQuery.mockResolvedValue({ data: { eraActiveValidatorCount: count } })
		useActiveValidatorCount()
		await expect(fetchLatest()).rejects.toThrow('invalid validator count')
	},
)
