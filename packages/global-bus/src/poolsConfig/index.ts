// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PoolsConfig } from 'types'
import { defaultPoolsConfig } from './default'
import { _poolsConfig } from './private'

export const poolsConfig$ = _poolsConfig.asObservable()

export const resetPoolsConfig = () => {
	_poolsConfig.next(defaultPoolsConfig)
}

export const getPoolsConfig = () => _poolsConfig.getValue()

export const setPoolsConfig = (config: PoolsConfig) => {
	_poolsConfig.next(config)
}

export * from './default'
