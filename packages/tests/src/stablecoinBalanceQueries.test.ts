// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StablecoinBalance } from 'types'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const balanceQueries = vi.hoisted(() => ({
	hydration: vi.fn(),
	statemint: vi.fn(),
}))

const balanceState = vi.hoisted(() => {
	type Entry = {
		balances: StablecoinBalance[]
		requestId?: number
		status: 'idle' | 'syncing' | 'synced' | 'error'
	}

	const entries: Record<string, Entry> = {}
	let requestId = 0

	return {
		get: (address: string): Entry =>
			entries[address] || { balances: [], status: 'idle' },
		reset: () => {
			for (const address of Object.keys(entries)) {
				delete entries[address]
			}
		},
		set: (address: string, balances: StablecoinBalance[], id: number) => {
			if (entries[address]?.requestId === id) {
				entries[address] = { balances, status: 'synced' }
			}
		},
		setError: (address: string, id: number) => {
			const current = entries[address]
			if (current?.requestId === id) {
				entries[address] = {
					balances: current.balances,
					status: 'error',
				}
			}
		},
		setSyncing: (address: string) => {
			const id = ++requestId
			entries[address] = {
				...(entries[address] || { balances: [], status: 'idle' }),
				requestId: id,
				status: 'syncing',
			}
			return id
		},
	}
})

vi.mock('../../global-bus/src/index.ts', () => ({
	getStablecoinBalances: balanceState.get,
	setStablecoinBalances: balanceState.set,
	setStablecoinBalancesError: balanceState.setError,
	setStablecoinBalancesSyncing: balanceState.setSyncing,
}))

vi.mock('../../dedot-api/src/stablecoins/assetHub', () => ({
	createAssetHubStablecoinAdapter: () => ({
		balance: balanceQueries.statemint,
		estimateFee: vi.fn(),
		feeAssets: ['USDC'],
		paymentOptions: vi.fn(),
		transfer: vi.fn(),
	}),
}))

vi.mock('../../dedot-api/src/stablecoins/hydration', () => ({
	createHydrationStablecoinAdapter: () => ({
		balance: balanceQueries.hydration,
		estimateFee: vi.fn(),
		feeAssets: ['USDC'],
		hydrationFeeCurrency: vi.fn(),
		paymentOptions: vi.fn(),
		setHydrationFeeCurrency: vi.fn(),
		transfer: vi.fn(),
	}),
}))

import { createStablecoinsInterface } from '../../dedot-api/src/stablecoins'

const deferred = <T>() => {
	let resolve!: (value: T) => void
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise
	})
	return { promise, resolve }
}

const createBalance = (
	chain: StablecoinBalance['chain'],
	free: bigint,
): StablecoinBalance => ({
	chain,
	decimals: 6,
	existentialDeposit: 0n,
	free,
	frozen: 0n,
	symbol: 'USDC',
})

const createService = () =>
	createStablecoinsInterface({} as never, async () => ({}) as never)

describe('stablecoin balance queries', () => {
	beforeEach(() => {
		balanceState.reset()
		vi.clearAllMocks()
	})

	test('deduplicates concurrent reads for one address', async () => {
		const statemint = deferred<StablecoinBalance>()
		const hydration = deferred<StablecoinBalance>()
		balanceQueries.statemint.mockReturnValueOnce(statemint.promise)
		balanceQueries.hydration.mockReturnValueOnce(hydration.promise)
		const service = createService()

		const first = service.query.balances('alice')
		const second = service.query.balances('alice')

		expect(second).toBe(first)
		expect(balanceQueries.statemint).toHaveBeenCalledTimes(1)
		expect(balanceQueries.hydration).toHaveBeenCalledTimes(1)

		statemint.resolve(createBalance('statemint', 1n))
		hydration.resolve(createBalance('hydration', 2n))
		await expect(first).resolves.toHaveLength(2)
		expect(balanceState.get('alice').status).toBe('synced')
	})

	test('a new read after reset supersedes an older in-flight read', async () => {
		const oldStatemint = deferred<StablecoinBalance>()
		const oldHydration = deferred<StablecoinBalance>()
		const newStatemint = deferred<StablecoinBalance>()
		const newHydration = deferred<StablecoinBalance>()
		balanceQueries.statemint
			.mockReturnValueOnce(oldStatemint.promise)
			.mockReturnValueOnce(newStatemint.promise)
		balanceQueries.hydration
			.mockReturnValueOnce(oldHydration.promise)
			.mockReturnValueOnce(newHydration.promise)
		const service = createService()

		const stale = service.query.balances('alice')
		balanceState.reset()
		const fresh = service.query.balances('alice')
		expect(balanceQueries.statemint).toHaveBeenCalledTimes(2)
		expect(balanceQueries.hydration).toHaveBeenCalledTimes(2)

		oldStatemint.resolve(createBalance('statemint', 1n))
		oldHydration.resolve(createBalance('hydration', 2n))
		await stale

		const joined = service.query.balances('alice')
		expect(joined).toBe(fresh)
		expect(balanceQueries.statemint).toHaveBeenCalledTimes(2)
		expect(balanceQueries.hydration).toHaveBeenCalledTimes(2)

		newStatemint.resolve(createBalance('statemint', 3n))
		newHydration.resolve(createBalance('hydration', 4n))
		await joined
		expect(balanceState.get('alice').balances.map(({ free }) => free)).toEqual([
			3n,
			4n,
		])
	})
})
