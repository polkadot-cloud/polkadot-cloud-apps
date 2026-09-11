// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { type FetchQueryOptions, QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useEraNominatorCount } from '../../data-gate/src/eraNominatorCount'
import { useNodeEraStakers } from '../../data-gate/src/eraStakers/node'
import { useHasEraBacking } from '../../data-gate/src/hasEraBacking'
import { useNomineeStatuses } from '../../data-gate/src/nomineeStatuses'
import { fetchEraNomineeStatuses } from '../../data-gate/src/nomineeStatuses/stakingApi'
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
		ready: true,
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
	expect(exposureReads).toHaveBeenCalledWith(100, 'old-target')
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
