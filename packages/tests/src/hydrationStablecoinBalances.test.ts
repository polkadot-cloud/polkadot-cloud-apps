// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { describe, expect, test, vi } from 'vitest'
import { HydrationStablecoinBalancesQuery } from '../../dedot-api/src/subscribe/hydrationStablecoinBalances'

type Unsub = () => void
type TokenAccount = {
	free: bigint
	reserved: bigint
	frozen: bigint
}
type TokenCallback = (accounts: TokenAccount[]) => void

const tokenAccount = (free: bigint, frozen = 0n): TokenAccount => ({
	free,
	reserved: 0n,
	frozen,
})

const asHydrationApi = (accountsMulti: object) =>
	({
		query: { tokens: { accounts: { multi: accountsMulti } } },
	}) as unknown as Awaited<
		ReturnType<
			ConstructorParameters<typeof HydrationStablecoinBalancesQuery>[0]
		>
	>

describe('HydrationStablecoinBalancesQuery', () => {
	test('subscribes to non-ERC-20 Tokens balances and excludes HOLLAR', async () => {
		let callback: TokenCallback | undefined
		const unsub = vi.fn()
		const accountsMulti = vi.fn(
			(_keys: [string, number][], onUpdate: TokenCallback): Promise<Unsub> => {
				callback = onUpdate
				return Promise.resolve(unsub)
			},
		)
		const onBalance = vi.fn()
		const onError = vi.fn()
		const query = new HydrationStablecoinBalancesQuery(
			() => Promise.resolve(asHydrationApi(accountsMulti)),
			'alice',
			onBalance,
			onError,
		)

		await vi.waitFor(() => expect(accountsMulti).toHaveBeenCalledOnce())
		const keys = accountsMulti.mock.calls[0]?.[0]
		expect(keys).toEqual([
			['alice', 5],
			['alice', 22],
			['alice', 10],
		])
		expect(keys).not.toContainEqual(['alice', 222])

		callback?.([
			tokenAccount(10n, 1n),
			tokenAccount(20n, 2n),
			tokenAccount(30n, 3n),
		])

		expect(onBalance).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				chain: 'hydration',
				free: 10n,
				frozen: 1n,
				symbol: 'DOT',
			}),
		)
		expect(onBalance).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				chain: 'hydration',
				free: 20n,
				frozen: 2n,
				symbol: 'USDC',
			}),
		)
		expect(onBalance).toHaveBeenNthCalledWith(
			3,
			expect.objectContaining({
				chain: 'hydration',
				free: 30n,
				frozen: 3n,
				symbol: 'USDT',
			}),
		)
		expect(onBalance).not.toHaveBeenCalledWith(
			expect.objectContaining({ symbol: 'HOLLAR' }),
		)
		expect(onError).not.toHaveBeenCalled()

		query.unsubscribe()
		expect(unsub).toHaveBeenCalledOnce()
	})

	test('does not start a subscription when disposed before the API resolves', async () => {
		let resolveApi: (api: ReturnType<typeof asHydrationApi>) => void = () =>
			undefined
		const accountsMulti = vi.fn()
		const apiPromise = new Promise<ReturnType<typeof asHydrationApi>>(
			(resolve) => {
				resolveApi = resolve
			},
		)
		const onBalance = vi.fn()
		const onError = vi.fn()
		const query = new HydrationStablecoinBalancesQuery(
			() => apiPromise,
			'alice',
			onBalance,
			onError,
		)

		query.unsubscribe()
		resolveApi(asHydrationApi(accountsMulti))
		await apiPromise
		await Promise.resolve()

		expect(accountsMulti).not.toHaveBeenCalled()
		expect(onBalance).not.toHaveBeenCalled()
		expect(onError).not.toHaveBeenCalled()
	})

	test('reports API and subscription setup failures', async () => {
		const apiError = new Error('API connection failed')
		const apiOnError = vi.fn()
		const apiQuery = new HydrationStablecoinBalancesQuery(
			() => Promise.reject(apiError),
			'alice',
			vi.fn(),
			apiOnError,
		)
		await vi.waitFor(() => expect(apiOnError).toHaveBeenCalledWith(apiError))
		apiQuery.unsubscribe()

		const setupError = new Error('subscription failed')
		const setupOnError = vi.fn()
		const setupQuery = new HydrationStablecoinBalancesQuery(
			() =>
				Promise.resolve(
					asHydrationApi(vi.fn(() => Promise.reject(setupError))),
				),
			'alice',
			vi.fn(),
			setupOnError,
		)
		await vi.waitFor(() =>
			expect(setupOnError).toHaveBeenCalledWith(setupError),
		)
		setupQuery.unsubscribe()
	})
})
