// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PoolMembershipState } from 'types'
import { defaultPoolMembership } from './defaults'
import { _poolMemberships } from './private'

export const poolMemberships$ = _poolMemberships.asObservable()

export const resetPoolMemberships = () => {
	_poolMemberships.next({})
}

export const getPoolMembership = (
	address: string | null,
): PoolMembershipState => {
	if (!address) {
		return defaultPoolMembership
	}
	return _poolMemberships.getValue()?.[address] || defaultPoolMembership
}

export const setPoolMembership = (
	address: string,
	value: PoolMembershipState,
) => {
	const next = { ..._poolMemberships.getValue() }
	next[address] = value
	_poolMemberships.next(next)
}

export const removePoolMembership = (address: string) => {
	const next = { ..._poolMemberships.getValue() }
	delete next[address]
	_poolMemberships.next(next)
}

export * from './defaults'
