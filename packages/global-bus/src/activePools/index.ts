// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActivePool } from 'types'
import { _activePools } from './private'

export const activePools$ = _activePools.asObservable()

export const resetActivePools = () => {
	_activePools.next([])
}

export const getActivePool = (poolId: number) =>
	_activePools.getValue().find((pool) => pool.id === poolId)

export const setActivePool = (value: ActivePool) => {
	const next = [..._activePools.getValue()]
	const index = next.findIndex((pool) => pool.id === value.id)
	if (index === -1) {
		next.push(value)
	} else {
		next[index] = value
	}
	_activePools.next(next)
}

export const removeActivePool = (poolId: number) => {
	const next = [..._activePools.getValue()]
	const index = next.findIndex((pool) => pool.id === poolId)
	if (index !== -1) {
		next.splice(index, 1)
	}
	_activePools.next(next)
}

export * from './default'
