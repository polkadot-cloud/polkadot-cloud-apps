// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PoolWarningType } from 'plugin-staking-api/types'
import { defaultPoolWarnings } from './default'
import { _poolWarnings } from './private'

export interface PoolWarning {
	poolId: number
	address: string
	type: PoolWarningType
}

export interface PoolWarningsState {
	[address: string]: PoolWarning[]
}

export const poolWarnings$ = _poolWarnings.asObservable()

export const getPoolWarnings = (): PoolWarningsState => _poolWarnings.getValue()

export const getPoolWarningsForAddress = (address: string): PoolWarning[] =>
	_poolWarnings.getValue()[address] || []

export const setPoolWarnings = (
	address: string,
	warnings: PoolWarning[],
): void => {
	_poolWarnings.next({
		..._poolWarnings.value,
		[address]: warnings,
	})
}

export const setPoolWarningsBatch = (
	warningsMap: Record<string, PoolWarning[]>,
): void => {
	_poolWarnings.next({
		..._poolWarnings.value,
		...warningsMap,
	})
}

export const resetPoolWarnings = (): void => {
	_poolWarnings.next(defaultPoolWarnings)
}
