// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ServiceInterface } from 'types'
import { afterEach, expect, it, vi } from 'vitest'
import { createDataGate, type DataGate } from '../src'
import {
	activeNominatorCount,
	nominationBacking,
	nominationStatuses,
} from '../src/resources/nominations'
import { validatorRewardRates } from '../src/resources/performance'
import { tokenPrice } from '../src/resources/prices'
import { queryStakingApi } from '../src/sources/stakingApi'

vi.mock('../src/sources/stakingApi', () => ({ queryStakingApi: vi.fn() }))
const query = vi.mocked(queryStakingApi)
const gates: DataGate[] = []
const makeGate = (
	options: Partial<Parameters<typeof createDataGate>[0]> = {},
) => {
	const gate = createDataGate({
		network: 'polkadot',
		apiEnabled: true,
		modules: ['staking', 'validators', 'prices'],
		era: 10,
		...options,
	})
	gates.push(gate)
	return gate
}
const service = (query: Partial<ServiceInterface['query']>) =>
	({ query }) as ServiceInterface
afterEach(() => {
	gates.forEach((gate) => {
		gate.dispose()
	})
	gates.length = 0
	vi.resetAllMocks()
})

it('publishes API nomination status without waiting for slow backing RPCs', async () => {
	const exposure = Promise.withResolvers<undefined>()
	const overview = vi.fn(() => exposure.promise)
	const gate = makeGate({ node: service({ erasStakersOverview: overview }) })
	query.mockResolvedValue({
		getNomineesStatus: { statuses: [{ address: 'v1', status: 'active' }] },
	})
	const backing = gate.resource(nominationBacking('Alice', 'v1'))
	const pending = backing.read()
	expect(await gate.request(nominationStatuses('Alice', ['v1']))).toEqual({
		v1: 'active',
	})
	expect(backing.getSnapshot().status).toBe('loading')
	expect(overview).toHaveBeenCalledTimes(1)
	exposure.resolve(undefined)
	await pending
})

it('API nomination status and nominator count never start full node exposure scans', async () => {
	const all = vi.fn()
	const gate = makeGate({
		node: service({ erasStakersOverviewEntries: all }),
		nodeReady: false,
	})
	query
		.mockResolvedValueOnce({
			getNomineesStatus: { statuses: [{ address: 'v1', status: 'waiting' }] },
		})
		.mockResolvedValueOnce({ eraTotalNominators: { totalNominators: 27 } })
	expect(await gate.request(nominationStatuses('Alice', ['v1']))).toEqual({
		v1: 'waiting',
	})
	expect(await gate.request(activeNominatorCount())).toBe(27)
	expect(all).not.toHaveBeenCalled()
})

it('rejects incomplete API status responses instead of calling them waiting', async () => {
	query.mockResolvedValue({ getNomineesStatus: { statuses: [] } })
	const gate = makeGate()
	await expect(
		gate.request(nominationStatuses('Alice', ['v1'])),
	).rejects.toThrow('incomplete')
	expect(
		gate.resource(nominationStatuses('Alice', ['v1'])).getSnapshot().data,
	).toBeUndefined()
})

it('does not query for an empty nomination set and preserves a ready empty result', async () => {
	const gate = makeGate()
	expect(await gate.request(nominationStatuses('Alice', []))).toEqual({})
	expect(query).not.toHaveBeenCalled()
})

it('node mode queries only requested validators and shares exposure with backing amounts', async () => {
	const overview = vi.fn<ServiceInterface['query']['erasStakersOverview']>(
		async (_, address) =>
			address === 'waiting'
				? undefined
				: {
						own: 5n,
						total: 25n,
						pageCount: address === 'self' ? 0 : 1,
						nominatorCount: address === 'self' ? 0 : 1,
					},
	)
	const pages = vi.fn<ServiceInterface['query']['erasStakersPagedEntries']>(
		async (era, address) =>
			address === 'self'
				? []
				: [
						[
							[era, address, 0],
							{
								others: [
									{ who: address === 'active' ? 'Alice' : 'Bob', value: 20n },
								],
								pageTotal: 20n,
							},
						],
					],
	)
	const all = vi.fn()
	const gate = makeGate({
		apiEnabled: false,
		node: service({
			erasStakersOverview: overview,
			erasStakersPagedEntries: pages,
			erasStakersOverviewEntries: all,
		}),
	})
	expect(
		await gate.request(
			nominationStatuses('Alice', ['active', 'inactive', 'waiting', 'self']),
		),
	).toEqual({
		active: 'active',
		inactive: 'inactive',
		waiting: 'waiting',
		self: 'inactive',
	})
	expect(await gate.request(nominationBacking('Alice', 'active'))).toBe(20n)
	expect(overview).toHaveBeenCalledTimes(4)
	expect(all).not.toHaveBeenCalled()
	expect(query).not.toHaveBeenCalled()
})

it('rejects missing node exposure pages instead of showing inactive', async () => {
	const gate = makeGate({
		apiEnabled: false,
		node: service({
			erasStakersOverview: async () => ({
				own: 5n,
				total: 25n,
				pageCount: 1,
				nominatorCount: 1,
			}),
			erasStakersPagedEntries: async () => [],
		}),
	})
	await expect(
		gate.request(nominationStatuses('Alice', ['v1'])),
	).rejects.toThrow('Incomplete exposure')
})

it('Kusama API APY does not require node payout or exposure data', async () => {
	query.mockResolvedValue({
		validatorAvgRewardRateBatch: [{ validator: 'v1', rate: 11 }],
	})
	const gate = makeGate({ network: 'kusama' })
	expect(await gate.request(validatorRewardRates(['v1']))).toEqual({
		validatorAvgRewardRateBatch: [{ validator: 'v1', rate: 11 }],
	})
	expect(query.mock.calls[0][1]).toMatchObject({ chain: 'kusama', fromEra: 9 })
})

it('prices work with no staking module, node, or era', async () => {
	query.mockResolvedValue({ tokenPrice: { price: 3 } })
	const gate = makeGate({ modules: ['prices'], era: 0 })
	expect(await gate.request(tokenPrice('DOT'))).toEqual({ price: 3 })
	expect(gate.policy.sources.nominationStatuses).toBe('disabled')
})

it('refreshes a waiting API status after indexer catch-up', async () => {
	vi.useFakeTimers()
	query
		.mockResolvedValueOnce({
			getNomineesStatus: { statuses: [{ address: 'v1', status: 'waiting' }] },
		})
		.mockResolvedValueOnce({
			getNomineesStatus: { statuses: [{ address: 'v1', status: 'active' }] },
		})
	const entry = makeGate().resource(nominationStatuses('Alice', ['v1']))
	const unsubscribe = entry.subscribe(() => {})
	await entry.read()
	expect(entry.getSnapshot().data).toEqual({ v1: 'waiting' })
	await vi.advanceTimersByTimeAsync(30_000)
	expect(entry.getSnapshot().data).toEqual({ v1: 'active' })
	unsubscribe()
	vi.useRealTimers()
})

it('does not fall back to node exposure scans on an API failure', async () => {
	query.mockRejectedValue(new Error('Indexer unavailable'))
	const overview = vi.fn()
	const gate = makeGate({ node: service({ erasStakersOverview: overview }) })
	await expect(
		gate.request(nominationStatuses('Alice', ['v1'])),
	).rejects.toThrow('Indexer unavailable')
	expect(overview).not.toHaveBeenCalled()
})

it('an API-disabled price module performs no API work', async () => {
	const gate = makeGate({ apiEnabled: false, modules: ['prices'] })
	expect(gate.resource(tokenPrice('DOT')).getSnapshot().status).toBe('disabled')
	await expect(gate.request(tokenPrice('DOT'))).rejects.toThrow('unavailable')
	expect(query).not.toHaveBeenCalled()
})

it('shares the previous-era payout across node APY batches', async () => {
	const points = vi.fn<ServiceInterface['query']['erasRewardPoints']>(
		async () => ({ total: 2, individual: [] }),
	)
	const payout = vi.fn(async () => 100n)
	const gate = makeGate({
		apiEnabled: false,
		node: service({
			erasRewardPoints: points,
			erasValidatorReward: payout,
			erasStakersOverview: async () => undefined,
		}),
	})
	await Promise.all([
		gate.request(validatorRewardRates(['v1'])),
		gate.request(validatorRewardRates(['v2'])),
	])
	expect(points).toHaveBeenCalledTimes(1)
	expect(payout).toHaveBeenCalledTimes(1)
	expect(query).not.toHaveBeenCalled()
})

it('refreshes pool filter results after a cached waiting status changes', async () => {
	vi.useFakeTimers()
	const { poolStatuses } = await import('../src/resources/pools')
	query
		.mockResolvedValueOnce({
			getNomineesStatus: { statuses: [{ address: 'v1', status: 'waiting' }] },
		})
		.mockResolvedValueOnce({
			getNomineesStatus: { statuses: [{ address: 'v1', status: 'active' }] },
		})
	const entry = makeGate().resource(
		poolStatuses([{ who: 'pool', targets: ['v1'] }]),
	)
	const unsubscribe = entry.subscribe(() => {})
	await entry.read()
	expect(entry.getSnapshot().data).toEqual({ pool: { v1: 'waiting' } })
	await vi.advanceTimersByTimeAsync(60_000)
	expect(entry.getSnapshot().data).toEqual({ pool: { v1: 'active' } })
	unsubscribe()
	vi.useRealTimers()
})
