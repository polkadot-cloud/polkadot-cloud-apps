// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncId } from 'types'

export const allSyncIds: SyncId[] = [
	'initialization',
	'active-pools',
	'active-proxy',
	'staking-ledgers',
]

export const defaultSyncStatus: SyncId[] = ['initialization', 'active-proxy']
