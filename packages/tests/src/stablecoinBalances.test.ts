// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FeeAssetSymbol, StablecoinBalance } from 'types'
import { beforeEach, describe, expect, test } from 'vitest'
import {
	getStablecoinBalances,
	resetStablecoinBalances,
	setStablecoinBalances,
	setStablecoinBalancesError,
	setStablecoinBalancesSyncing,
} from '../../global-bus/src/stablecoinBalances'

const createBalance = (
	free: bigint,
	symbol: FeeAssetSymbol = 'USDC',
): StablecoinBalance => ({
	chain: 'statemint',
	decimals: symbol === 'DOT' ? 10 : 6,
	existentialDeposit: 0n,
	free,
	frozen: 0n,
	symbol,
})

describe('stablecoin balance state', () => {
	beforeEach(() => {
		resetStablecoinBalances()
	})

	test('returns an idle default for an uncached address', () => {
		expect(getStablecoinBalances('alice')).toEqual({
			balances: [],
			status: 'idle',
		})
	})

	test('preserves cached balances while refreshing', () => {
		const initialRequest = setStablecoinBalancesSyncing('alice')
		const cached = [createBalance(10_000_000n)]
		setStablecoinBalances('alice', cached, initialRequest)

		const refreshRequest = setStablecoinBalancesSyncing('alice')
		expect(getStablecoinBalances('alice')).toEqual({
			balances: cached,
			requestId: refreshRequest,
			status: 'syncing',
		})
	})

	test('only allows the current request to update an address', () => {
		const staleRequest = setStablecoinBalancesSyncing('alice')
		const currentRequest = setStablecoinBalancesSyncing('alice')

		setStablecoinBalances('alice', [createBalance(1n)], staleRequest)
		setStablecoinBalancesError('alice', staleRequest)
		expect(getStablecoinBalances('alice').requestId).toBe(currentRequest)
		expect(getStablecoinBalances('alice').status).toBe('syncing')

		const current = [createBalance(2n)]
		setStablecoinBalances('alice', current, currentRequest)
		expect(getStablecoinBalances('alice')).toEqual({
			balances: current,
			status: 'synced',
		})
	})

	test('does not accept a completion from before a reset', () => {
		const staleRequest = setStablecoinBalancesSyncing('alice')
		resetStablecoinBalances()
		setStablecoinBalances('alice', [createBalance(1n)], staleRequest)

		expect(getStablecoinBalances('alice').status).toBe('idle')

		const currentRequest = setStablecoinBalancesSyncing('alice')
		setStablecoinBalances('alice', [createBalance(2n)], staleRequest)
		setStablecoinBalances('alice', [createBalance(3n)], currentRequest)
		expect(getStablecoinBalances('alice').balances[0]?.free).toBe(3n)
	})

	test('keeps cached addresses isolated', () => {
		const aliceRequest = setStablecoinBalancesSyncing('alice')
		const bobRequest = setStablecoinBalancesSyncing('bob')
		setStablecoinBalances('alice', [createBalance(1n)], aliceRequest)
		setStablecoinBalances('bob', [createBalance(2n)], bobRequest)

		expect(getStablecoinBalances('alice').balances[0]?.free).toBe(1n)
		expect(getStablecoinBalances('bob').balances[0]?.free).toBe(2n)
	})
})
