// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
	createDataGate,
	type DataGate,
	type ResourceDefinition,
	resolveDataPolicy,
} from '../src'

const gates: DataGate[] = []
const makeGate = (
	options: Partial<Parameters<typeof createDataGate>[0]> = {},
) => {
	const gate = createDataGate({
		network: 'polkadot',
		apiEnabled: true,
		modules: ['prices'],
		...options,
	})
	gates.push(gate)
	return gate
}
const definition = <T>(
	load: ResourceDefinition<T>['load'],
	options: Partial<ResourceDefinition<T>> = {},
): ResourceDefinition<T> => ({
	name: 'tokenPrice',
	key: ['DOT'],
	load,
	...options,
})
afterEach(() => {
	gates.forEach((gate) => {
		gate.dispose()
	})
	gates.length = 0
	vi.useRealTimers()
})

describe('routing policy', () => {
	it.each(['polkadot', 'kusama', 'paseo'] as const)(
		'has no enabled resource without modules on %s',
		(network) => {
			expect(
				new Set(Object.values(resolveDataPolicy(network, true, []).sources)),
			).toEqual(new Set(['disabled']))
		},
	)
	it('separates API support, retainment support, and node-only resources', () => {
		const polkadot = resolveDataPolicy('polkadot', true, [
			'staking',
			'validators',
			'prices',
		])
		const kusama = resolveDataPolicy('kusama', true, [
			'staking',
			'validators',
			'prices',
		])
		const node = resolveDataPolicy('polkadot', false, [
			'staking',
			'validators',
			'prices',
		])
		expect(polkadot.sources.nominationStatuses).toBe('staking-api')
		expect(polkadot.sources.nominationBacking).toBe('node')
		expect(polkadot.sources.optimalValidators).toBe('staking-api')
		expect(kusama.sources.validatorPerformance).toBe('staking-api')
		expect(kusama.sources.optimalValidators).toBe('node')
		expect(kusama.sources.validatorDetails).toBe('disabled')
		expect(node.sources.nominationStatuses).toBe('node')
		expect(node.sources.tokenPrice).toBe('disabled')
		expect(
			resolveDataPolicy('paseo', true, ['staking']).sources.nominationStatuses,
		).toBe('node')
	})
})

it('does no work on creation and deduplicates subscribers with imperative reads', async () => {
	const load = vi.fn(async () => 12)
	const gate = makeGate()
	const entry = gate.resource(definition(load))
	expect(load).not.toHaveBeenCalled()
	const unsubscribe = entry.subscribe(vi.fn())
	const other = gate.resource(definition(load))
	expect(other).toBe(entry)
	expect(await gate.request(definition(load))).toBe(12)
	expect(load).toHaveBeenCalledTimes(1)
	unsubscribe()
})

it('a prices-only consumer needs neither a node nor an era', async () => {
	const gate = makeGate()
	expect(
		await gate.request(
			definition(async (context) => {
				expect(context.era).toBe(0)
				expect(context.nodeReady).toBe(false)
				return 'price'
			}),
		),
	).toBe('price')
})

it('never invokes disabled or blocked loaders, and reports prerequisites', async () => {
	const load = vi.fn(async () => [])
	const gate = makeGate()
	const disabled = gate.resource({
		...definition(load),
		name: 'nominationStatuses',
	})
	const blocked = gate.resource(definition(load, { requires: ['era'] }))
	const unsub = blocked.subscribe(vi.fn())
	await Promise.all([disabled.read(), blocked.read()])
	expect(load).not.toHaveBeenCalled()
	expect(disabled.getSnapshot().status).toBe('disabled')
	expect(blocked.getSnapshot().status).toBe('blocked')
	expect(gate.getDiagnostics()[0]).toMatchObject({
		status: 'blocked',
		requires: ['era'],
	})
	unsub()
})

it('treats a valid empty result as ready', async () => {
	const entry = makeGate().resource(definition(async () => []))
	await entry.read()
	expect(entry.getSnapshot()).toMatchObject({
		status: 'ready',
		data: [],
		error: undefined,
	})
})

it('timeouts are errors and never a successful sync', async () => {
	vi.useFakeTimers()
	const gate = makeGate({ requestTimeoutMs: 100 })
	let signal: AbortSignal | undefined
	const entry = gate.resource(
		definition((context) => {
			signal = context.signal
			return new Promise(() => {})
		}),
	)
	const pending = entry.read()
	await vi.advanceTimersByTimeAsync(99)
	expect(entry.getSnapshot().status).toBe('loading')
	await vi.advanceTimersByTimeAsync(1)
	await pending
	expect(entry.getSnapshot().status).toBe('error')
	expect(entry.getSnapshot().error?.message).toContain('timed out')
	expect(signal?.aborted).toBe(true)
})

it('exposes failures to imperative callers and can explicitly retry', async () => {
	const load = vi
		.fn()
		.mockRejectedValueOnce(new Error('Offline'))
		.mockResolvedValueOnce(3)
	const gate = makeGate()
	await expect(gate.request(definition(load))).rejects.toThrow('Offline')
	expect(gate.getDiagnostics()[0].status).toBe('error')
	expect(await gate.request(definition(load), { refresh: true })).toBe(3)
})

it('invalidates in-flight work and ignores late results from uncancellable transports', async () => {
	const first = Promise.withResolvers<number>()
	const load = vi
		.fn()
		.mockReturnValueOnce(first.promise)
		.mockResolvedValueOnce(2)
	const gate = makeGate()
	const entry = gate.resource(definition(load))
	const old = entry.read()
	await Promise.resolve()
	gate.invalidate(['tokenPrice'])
	expect(await entry.read()).toBe(2)
	first.resolve(1)
	await old
	expect(entry.getSnapshot().data).toBe(2)
})

it('disposal aborts pending requests and suppresses their results', async () => {
	const deferred = Promise.withResolvers<number>()
	let signal: AbortSignal | undefined
	const gate = makeGate()
	const entry = gate.resource(
		definition((context) => {
			signal = context.signal
			return deferred.promise
		}),
	)
	const pending = entry.read()
	await Promise.resolve()
	gate.dispose()
	deferred.resolve(1)
	await pending
	expect(signal?.aborted).toBe(true)
	expect(entry.getSnapshot().data).toBeUndefined()
})

it('cancels dependent work before it can start after invalidation', async () => {
	const deferred = Promise.withResolvers<void>()
	const childLoad = vi.fn(async () => 'child')
	const gate = makeGate()
	const entry = gate.resource(
		definition(async (context) => {
			await deferred.promise
			return context.request(definition(childLoad, { key: ['child'] }))
		}),
	)
	const old = entry.read()
	await Promise.resolve()
	gate.invalidate()
	deferred.resolve()
	await old
	await Promise.resolve()
	expect(childLoad).not.toHaveBeenCalled()
})

it('only polls while consumers subscribe and shares the interval', async () => {
	vi.useFakeTimers()
	const load = vi.fn(async () => 1)
	const entry = makeGate().resource(
		definition(load, { refreshIntervalMs: 100 }),
	)
	const a = entry.subscribe(vi.fn())
	const b = entry.subscribe(vi.fn())
	await vi.advanceTimersByTimeAsync(250)
	expect(load).toHaveBeenCalledTimes(3)
	a()
	b()
	await vi.advanceTimersByTimeAsync(500)
	expect(load).toHaveBeenCalledTimes(3)
})

it('isolates account keys and network/era/provider instances', async () => {
	const load = vi.fn(async () => 1)
	const gate = makeGate()
	await gate.request(definition(load, { key: ['Alice'] }))
	await gate.request(definition(load, { key: ['Bob'] }))
	await makeGate({ network: 'kusama' }).request(
		definition(load, { key: ['Alice'] }),
	)
	await makeGate({ era: 2 }).request(definition(load, { key: ['Alice'] }))
	expect(load).toHaveBeenCalledTimes(4)
})

it('survives the provider effect cleanup/setup replay and disposes on the real unmount', async () => {
	const gate = makeGate()
	const leave = gate.mount()
	leave()
	const leaveAgain = gate.mount()
	await Promise.resolve()
	expect(await gate.request(definition(async () => 1))).toBe(1)
	leaveAgain()
	await Promise.resolve()
	await expect(gate.request(definition(async () => 1))).rejects.toThrow(
		'disposed',
	)
})

it('refreshes stale dependencies on demand without background polling', async () => {
	vi.useFakeTimers()
	const load = vi.fn(async () => 1)
	const gate = makeGate()
	const data = definition(load, { staleTimeMs: 100 })
	await gate.request(data)
	await vi.advanceTimersByTimeAsync(200)
	expect(load).toHaveBeenCalledTimes(1)
	await gate.request(data)
	expect(load).toHaveBeenCalledTimes(2)
})
