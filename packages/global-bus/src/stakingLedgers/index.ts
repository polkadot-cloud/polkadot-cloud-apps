// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StakingLedger } from 'types'
import { defaultStakingLedger } from './default'
import { _stakingLedgers } from './private'

export const stakingLedgers$ = _stakingLedgers.asObservable()

export const resetStakingLedgers = () => {
	_stakingLedgers.next({})
}

export const getStakingLedger = (address: string): StakingLedger =>
	_stakingLedgers.getValue()?.[address] || defaultStakingLedger

export const setStakingLedger = (address: string, value: StakingLedger) => {
	const next = { ..._stakingLedgers.getValue() }
	next[address] = value
	_stakingLedgers.next(next)
}

export const removeStakingLedger = (address: string) => {
	const next = { ..._stakingLedgers.getValue() }
	delete next[address]
	_stakingLedgers.next(next)
}

export * from './default'
