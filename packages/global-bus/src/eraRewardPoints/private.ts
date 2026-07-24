// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { EraRewardPoints } from 'types'
import { defaultEraRewardPoints } from './default'

export const _eraRewardPoints = new BehaviorSubject<EraRewardPoints>(
	defaultEraRewardPoints,
)
