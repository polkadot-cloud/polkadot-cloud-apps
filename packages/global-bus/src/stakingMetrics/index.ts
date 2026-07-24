// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StakingMetrics } from 'types'
import { defaultStakingMetrics } from './default'
import { _stakingMetrics } from './private'

export const stakingMetrics$ = _stakingMetrics.asObservable()

export const resetStakingMetrics = () => {
	_stakingMetrics.next(defaultStakingMetrics)
}

export const getStakingyMetrics = () => _stakingMetrics.getValue()

export const setStakingMetrics = (metrics: StakingMetrics) => {
	_stakingMetrics.next(metrics)
}

export * from './default'
