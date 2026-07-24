// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { ChainSpec } from 'types'

export const _chainSpecs = new BehaviorSubject<Record<string, ChainSpec>>({})
