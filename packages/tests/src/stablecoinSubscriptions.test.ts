// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StablecoinBalance } from 'types'
import { expect, test, vi } from 'vitest'
import { createStablecoinSubscriptions } from '../../dedot-api/src/stablecoins/subscriptions'

type HubApi = Parameters<typeof createStablecoinSubscriptions>[0]
type HydrationApi = Awaited<
	ReturnType<Parameters<typeof createStablecoinSubscriptions>[1]>
>
const features = { assetHub: true, hydration: true }

test('imported accounts and delivery watchers share Asset Hub subscriptions until the last consumer leaves', async () => {
	let updateNative!: (info: { data: { free: bigint; frozen: bigint } }) => void
	const unsubs = Array.from({ length: 4 }, () => vi.fn())
	const native = vi.fn(async (_address, callback) => {
		updateNative = callback
		callback({ data: { free: 100n, frozen: 0n } })
		return unsubs[0]
	})
	let assetIndex = 0
	const asset = vi.fn(async (_key, callback) => {
		callback(undefined)
		return unsubs[++assetIndex]
	})
	const subscribe = createStablecoinSubscriptions(
		{
			query: { system: { account: native }, assets: { account: asset } },
		} as unknown as HubApi,
		vi.fn(),
		features,
	)
	const imported = vi.fn()
	const recipient = vi.fn()
	const onError = vi.fn()
	const releaseImported = subscribe.balances(
		'alice',
		'statemint',
		imported,
		onError,
	)
	await Promise.resolve()
	const releaseRecipient = subscribe.balances(
		'alice',
		'statemint',
		recipient,
		onError,
	)
	expect(native).toHaveBeenCalledOnce()
	expect(asset).toHaveBeenCalledTimes(3)
	expect(recipient).toHaveBeenCalledWith(
		expect.objectContaining({ symbol: 'DOT', free: 100n }),
	)
	releaseImported()
	expect(unsubs.every((unsub) => unsub.mock.calls.length === 0)).toBe(true)
	updateNative({ data: { free: 200n, frozen: 0n } })
	expect(recipient).toHaveBeenLastCalledWith(
		expect.objectContaining({ symbol: 'DOT', free: 200n }),
	)
	expect(imported).toHaveBeenCalledTimes(4)
	releaseRecipient()
	releaseRecipient()
	expect(unsubs.every((unsub) => unsub.mock.calls.length === 1)).toBe(true)
	const calls = recipient.mock.calls.length
	updateNative({ data: { free: 300n, frozen: 0n } })
	expect(recipient).toHaveBeenCalledTimes(calls)
	expect(onError).not.toHaveBeenCalled()
})

test('an external Hydration recipient uses a temporary live Tokens subscription', async () => {
	let update!: (balances: { free: bigint; frozen: bigint }[]) => void
	const unsubscribe = vi.fn()
	const multi = vi.fn(async (_keys, callback) => {
		update = callback
		return unsubscribe
	})
	const getApi = vi.fn(
		async () =>
			({
				query: { tokens: { accounts: { multi } } },
			}) as unknown as HydrationApi,
	)
	const subscribe = createStablecoinSubscriptions(
		{} as HubApi,
		getApi,
		features,
	)
	const onBalance = vi.fn<(balance: StablecoinBalance) => void>()
	const release = subscribe.balances(
		'external',
		'hydration',
		onBalance,
		vi.fn(),
	)
	await Promise.resolve()
	await Promise.resolve()
	expect(multi).toHaveBeenCalledWith(
		[
			['external', 5],
			['external', 22],
			['external', 10],
		],
		expect.any(Function),
	)
	update([
		{ free: 10_000_000_000n, frozen: 0n },
		{ free: 1_000_000n, frozen: 0n },
		{ free: 0n, frozen: 0n },
	])
	expect(onBalance).toHaveBeenCalledWith(
		expect.objectContaining({
			chain: 'hydration',
			symbol: 'USDC',
			free: 1_000_000n,
		}),
	)
	expect(onBalance).toHaveBeenCalledWith(
		expect.objectContaining({
			chain: 'hydration',
			symbol: 'DOT',
			free: 10_000_000_000n,
		}),
	)
	release()
	expect(unsubscribe).toHaveBeenCalledOnce()
})

test('cleanup before the Hydration API is ready prevents a late subscription from being created', async () => {
	let resolve!: (api: HydrationApi) => void
	const multi = vi.fn()
	const subscribe = createStablecoinSubscriptions(
		{} as HubApi,
		() =>
			new Promise<HydrationApi>((done) => {
				resolve = done
			}),
		features,
	)
	const release = subscribe.balances('external', 'hydration', vi.fn(), vi.fn())
	release()
	resolve({
		query: { tokens: { accounts: { multi } } },
	} as unknown as HydrationApi)
	await Promise.resolve()
	expect(multi).not.toHaveBeenCalled()
})

test('late subscription handles are released when the last consumer has already left', async () => {
	let resolve!: (unsubscribe: () => void) => void
	const unsubscribe = vi.fn()
	const multi = vi.fn(
		() =>
			new Promise<() => void>((done) => {
				resolve = done
			}),
	)
	const subscribe = createStablecoinSubscriptions(
		{} as HubApi,
		async () =>
			({
				query: { tokens: { accounts: { multi } } },
			}) as unknown as HydrationApi,
		features,
	)
	const release = subscribe.balances('external', 'hydration', vi.fn(), vi.fn())
	await Promise.resolve()
	release()
	resolve(unsubscribe)
	await Promise.resolve()
	expect(unsubscribe).toHaveBeenCalledOnce()
})
