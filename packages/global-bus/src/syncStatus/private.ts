// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { SyncId } from 'types'
import { defaultSyncStatus } from './default'

export const _syncStatus = new BehaviorSubject<SyncId[]>(defaultSyncStatus)

// Track active timeouts for each sync ID
export const _syncTimeouts = new Map<SyncId, ReturnType<typeof setTimeout>>()
