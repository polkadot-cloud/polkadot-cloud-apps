// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type SyncId =
	| 'initialization'
	| 'era-stakers'
	| 'bonded-pools'
	| 'active-pools'
	| 'active-proxy'

export type SyncStatus = 'syncing' | 'complete'

export type SyncConfig = '*' | SyncId[]
