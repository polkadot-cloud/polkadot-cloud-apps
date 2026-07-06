// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncConfig, SyncId } from 'types'
import { allSyncIds } from './default'

export const getIdsFromSyncConfig = (config: SyncConfig): SyncId[] | '*' => {
	if (config === '*' || !isSyncIdArray(config)) {
		return '*'
	}
	return config.filter((id) => allSyncIds.includes(id))
}

export const isSyncIdArray = (config: SyncConfig): config is SyncId[] =>
	Array.isArray(config) && config.every((item) => typeof item === 'string')
