// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type SyncId =
	| 'initialization'
	| 'active-pools'
	| 'active-proxy'
	| 'staking-ledgers'

export type SyncStatus = 'syncing' | 'complete'

export type SyncConfig = '*' | SyncId[]
