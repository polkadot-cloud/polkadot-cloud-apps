// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StablecoinBalance } from 'types'
import {
	_stablecoinBalances,
	type StablecoinBalancesEntry,
	type StablecoinBalancesState,
} from './private'

export type {
	StablecoinBalancesEntry,
	StablecoinBalancesState,
	StablecoinBalancesStatus,
} from './private'

export const defaultStablecoinBalances: StablecoinBalancesEntry = {
	balances: [],
	status: 'idle',
}

let requestCounter = 0

export const stablecoinBalances$ = _stablecoinBalances.asObservable()

export const getStablecoinBalancesState = (): StablecoinBalancesState =>
	_stablecoinBalances.getValue()

export const getStablecoinBalances = (
	address: string,
): StablecoinBalancesEntry =>
	_stablecoinBalances.getValue()[address] || defaultStablecoinBalances

export const setStablecoinBalancesSyncing = (address: string): number => {
	const requestId = ++requestCounter
	const state = _stablecoinBalances.getValue()
	const current = state[address] || defaultStablecoinBalances

	_stablecoinBalances.next({
		...state,
		[address]: {
			...current,
			requestId,
			status: 'syncing',
		},
	})

	return requestId
}

export const setStablecoinBalances = (
	address: string,
	balances: StablecoinBalance[],
	requestId: number,
) => {
	const state = _stablecoinBalances.getValue()
	if (state[address]?.requestId !== requestId) {
		return
	}

	_stablecoinBalances.next({
		...state,
		[address]: {
			balances,
			status: 'synced',
		},
	})
}

export const setStablecoinBalancesError = (
	address: string,
	requestId: number,
) => {
	const state = _stablecoinBalances.getValue()
	const current = state[address]
	if (current?.requestId !== requestId) {
		return
	}

	_stablecoinBalances.next({
		...state,
		[address]: {
			balances: current.balances,
			status: 'error',
		},
	})
}

// Updates one live balance while retaining the rest of the account snapshot and sync state.
export const setStablecoinBalance = (
	address: string,
	balance: StablecoinBalance,
) => {
	const state = _stablecoinBalances.getValue()
	const current = state[address]
	if (!current) {
		return
	}

	const index = current.balances.findIndex(
		({ chain, symbol }) => chain === balance.chain && symbol === balance.symbol,
	)
	const balances =
		index === -1
			? [...current.balances, balance]
			: current.balances.map((currentBalance, currentIndex) =>
					currentIndex === index ? balance : currentBalance,
				)

	_stablecoinBalances.next({
		...state,
		[address]: {
			...current,
			balances,
		},
	})
}

// Marks a live subscription as unhealthy while retaining the last known balances.
export const setStablecoinBalancesSubscriptionError = (address: string) => {
	const state = _stablecoinBalances.getValue()
	const current = state[address]
	if (!current) {
		return
	}

	_stablecoinBalances.next({
		...state,
		[address]: {
			...current,
			status: 'error',
		},
	})
}

export const removeStablecoinBalances = (address: string) => {
	const state = { ..._stablecoinBalances.getValue() }
	if (!state[address]) {
		return
	}

	delete state[address]
	_stablecoinBalances.next(state)
}

export const resetStablecoinBalances = () => {
	_stablecoinBalances.next({})
}
