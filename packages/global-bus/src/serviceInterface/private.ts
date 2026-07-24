// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { ServiceInterface } from 'types'
import { defaultServiceInterface } from './default'

export const _serviceInterface = new BehaviorSubject<ServiceInterface>(
	defaultServiceInterface,
)
