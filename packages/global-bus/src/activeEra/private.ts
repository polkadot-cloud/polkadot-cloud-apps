// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { ActiveEra } from 'types'
import { defaultActiveEra } from './default'

export const _activeEra = new BehaviorSubject<ActiveEra>(defaultActiveEra)
