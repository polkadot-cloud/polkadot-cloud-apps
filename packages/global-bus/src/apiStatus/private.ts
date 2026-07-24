// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { ApiStatus } from 'types'

export const _apiStatus = new BehaviorSubject<Record<string, ApiStatus>>({})
