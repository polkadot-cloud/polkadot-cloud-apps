// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { _activePoolIds } from './private'

export const activePoolIds$ = _activePoolIds.asObservable()

export const resetActivePoolIds = () => {
	_activePoolIds.next([])
}

export const getActivePoolIds = () => _activePoolIds.getValue()

export const addActivePoolId = (poolId: number) => {
	const next = [..._activePoolIds.getValue()]
	if (!next.includes(poolId)) {
		next.push(poolId)
	}
	_activePoolIds.next(next)
}

export const removeActivePoolId = (poolId: number) => {
	const next = [..._activePoolIds.getValue()].filter((id) => id !== poolId)
	_activePoolIds.next(next)
}
