// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { StakingMetrics } from 'types'
import { defaultStakingMetrics } from './default'

export const _stakingMetrics = new BehaviorSubject<StakingMetrics>(
	defaultStakingMetrics,
)
