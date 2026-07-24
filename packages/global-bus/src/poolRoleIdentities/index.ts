// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RoleIdentities } from 'types'
import { _poolRoleIdentities } from './private'

export const poolRoleIdentities$ = _poolRoleIdentities.asObservable()

export const resetPoolRoleIdentities = () => {
	_poolRoleIdentities.next({})
}

export const getPoolRoleIdentities = (poolId: number) =>
	_poolRoleIdentities.getValue()[poolId]

export const setPoolRoleIdentities = (
	poolId: number,
	value: RoleIdentities,
) => {
	const next = { ..._poolRoleIdentities.getValue() }
	next[poolId] = value
	_poolRoleIdentities.next(next)
}

export const removePoolRoleIdentities = (poolId: number) => {
	const next = { ..._poolRoleIdentities.getValue() }
	delete next[poolId]
	_poolRoleIdentities.next(next)
}

export * from './private'
