// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountBalance, ChainId } from 'types'
import { defaultAccountBalance } from './default'
import { _accountBalances } from './private'

export const accountBalances$ = _accountBalances.asObservable()

export const resetAccountBalances = () => {
	_accountBalances.next({})
}

export const getAccountBalance = (
	network: ChainId,
	address: string,
): AccountBalance =>
	_accountBalances.getValue()?.[network]?.[address] || defaultAccountBalance

export const setAccountBalance = (
	network: ChainId,
	address: string,
	value: AccountBalance,
) => {
	const next = { ..._accountBalances.getValue() }
	if (!next[network]) {
		next[network] = {}
	}
	next[network][address] = value
	_accountBalances.next(next)
}

export const removeAccountBalance = (network: ChainId, address: string) => {
	const next = { ..._accountBalances.getValue() }
	if (next[network]) {
		delete next[network][address]
	}
	_accountBalances.next(next)
}

export * from './default'
