// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { describe, expect, test, vi } from 'vitest'
import { AssetHubStablecoinBalancesQuery } from '../../dedot-api/src/subscribe/assetHubStablecoinBalances'

type Unsub = () => void
type NativeAccount = {
	nonce: number
	consumers: number
	providers: number
	sufficients: number
	data: { free: bigint; reserved: bigint; frozen: bigint; flags: bigint }
}
type AssetAccount = {
	balance: bigint
	status: 'Liquid' | 'Frozen' | 'Blocked'
	reason: { type: 'Sufficient' }
	extra: []
}
type NativeCallback = (account: NativeAccount) => void
type AssetCallback = (account: AssetAccount | undefined) => void

const nativeAccount = (free: bigint, frozen = 0n): NativeAccount => ({
	nonce: 0,
	consumers: 0,
	providers: 0,
	sufficients: 0,
	data: { free, reserved: 0n, frozen, flags: 0n },
})

const assetAccount = (
	balance: bigint,
	status: AssetAccount['status'] = 'Liquid',
): AssetAccount => ({
	balance,
	status,
	reason: { type: 'Sufficient' },
	extra: [],
})

const asAssetHubApi = (query: object) =>
	({ query }) as unknown as ConstructorParameters<
		typeof AssetHubStablecoinBalancesQuery
	>[0]

describe('AssetHubStablecoinBalancesQuery', () => {
	test('subscribes to native DOT and every configured Assets pallet balance', async () => {
		let nativeCallback: NativeCallback | undefined
		const assetCallbacks = new Map<number, AssetCallback>()
		const nativeUnsub = vi.fn()
		const assetUnsubs = new Map<number, ReturnType<typeof vi.fn>>()
		const systemAccount = vi.fn(
			(_address: string, callback: NativeCallback): Promise<Unsub> => {
				nativeCallback = callback
				return Promise.resolve(nativeUnsub)
			},
		)
		const assetsAccount = vi.fn(
			(
				[assetId]: [number, string],
				callback: AssetCallback,
			): Promise<Unsub> => {
				assetCallbacks.set(assetId, callback)
				const unsub = vi.fn()
				assetUnsubs.set(assetId, unsub)
				return Promise.resolve(unsub)
			},
		)
		const onBalance = vi.fn()
		const onError = vi.fn()
		const query = new AssetHubStablecoinBalancesQuery(
			asAssetHubApi({
				system: { account: systemAccount },
				assets: { account: assetsAccount },
			}),
			'alice',
			onBalance,
			onError,
		)

		await vi.waitFor(() => {
			expect(systemAccount).toHaveBeenCalledOnce()
			expect(assetsAccount).toHaveBeenCalledTimes(2)
		})

		nativeCallback?.(nativeAccount(10n, 2n))
		assetCallbacks.get(1337)?.(assetAccount(20n))
		assetCallbacks.get(1984)?.(assetAccount(30n, 'Frozen'))

		expect(onBalance).toHaveBeenCalledWith(
			expect.objectContaining({
				chain: 'statemint',
				free: 10n,
				frozen: 2n,
				symbol: 'DOT',
			}),
		)
		expect(onBalance).toHaveBeenCalledWith(
			expect.objectContaining({ free: 20n, frozen: 0n, symbol: 'USDC' }),
		)
		expect(onBalance).toHaveBeenCalledWith(
			expect.objectContaining({ free: 30n, frozen: 30n, symbol: 'USDT' }),
		)
		assetCallbacks.get(1337)?.(undefined)
		expect(onBalance).toHaveBeenLastCalledWith(
			expect.objectContaining({ free: 0n, frozen: 0n, symbol: 'USDC' }),
		)
		expect(onError).not.toHaveBeenCalled()

		query.unsubscribe()
		expect(nativeUnsub).toHaveBeenCalledOnce()
		expect(assetUnsubs.get(1337)).toHaveBeenCalledOnce()
		expect(assetUnsubs.get(1984)).toHaveBeenCalledOnce()
	})

	test('tears down subscriptions that finish setting up after disposal', async () => {
		const callbacks: Array<NativeCallback | AssetCallback> = []
		const resolves: Array<(unsub: Unsub) => void> = []
		const unsubs = [vi.fn(), vi.fn(), vi.fn()]
		const pendingSubscription = (callback: NativeCallback | AssetCallback) => {
			callbacks.push(callback)
			return new Promise<Unsub>((resolve) => resolves.push(resolve))
		}
		const onBalance = vi.fn()
		const onError = vi.fn()
		const query = new AssetHubStablecoinBalancesQuery(
			asAssetHubApi({
				system: {
					account: (_address: string, callback: NativeCallback) =>
						pendingSubscription(callback),
				},
				assets: {
					account: (_key: [number, string], callback: AssetCallback) =>
						pendingSubscription(callback),
				},
			}),
			'alice',
			onBalance,
			onError,
		)

		query.unsubscribe()
		resolves.forEach((resolve, index) => {
			resolve(unsubs[index])
		})
		await Promise.resolve()

		unsubs.forEach((unsub) => {
			expect(unsub).toHaveBeenCalledOnce()
		})
		const nativeCallback = callbacks[0] as NativeCallback
		const assetCallback = callbacks[1] as AssetCallback
		nativeCallback(nativeAccount(10n))
		assetCallback(assetAccount(20n))
		expect(onBalance).not.toHaveBeenCalled()
		expect(onError).not.toHaveBeenCalled()
	})

	test('reports subscription setup failures while active', async () => {
		const error = new Error('subscription failed')
		const onError = vi.fn()
		const query = new AssetHubStablecoinBalancesQuery(
			asAssetHubApi({
				system: {
					account: () => Promise.reject(error),
				},
				assets: {
					account: () => Promise.resolve(vi.fn()),
				},
			}),
			'alice',
			vi.fn(),
			onError,
		)

		await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error))
		query.unsubscribe()
	})
})
