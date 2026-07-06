// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SyncTimeoutDuration } from 'consts'
import type { SyncConfig, SyncId } from 'types'
import { _syncStatus, _syncTimeouts } from './private'

export const syncStatus$ = _syncStatus.asObservable()

export const getSyncIds = (activeIds: SyncConfig) => {
	if (activeIds === '*') {
		return _syncStatus.getValue()
	}
	return _syncStatus.getValue().filter((id) => activeIds.includes(id))
}

// Helper to get a specific sync ID status
export const getSyncing = (id: string) =>
	_syncStatus.getValue().find((syncId) => syncId === id)

// Helper to clear timeout for a sync ID
const clearSyncTimeout = (id: SyncId) => {
	const timeoutId = _syncTimeouts.get(id)
	if (timeoutId) {
		clearTimeout(timeoutId)
		_syncTimeouts.delete(id)
	}
}

// Helper to start timeout for a sync ID
const startSyncTimeout = (id: SyncId) => {
	// Clear any existing timeout for this ID
	clearSyncTimeout(id)

	// Start new timeout
	const timeoutId = setTimeout(() => {
		// Remove sync ID after timeout
		const newSyncStatus = _syncStatus
			.getValue()
			.filter((syncId) => syncId !== id)
		_syncStatus.next(newSyncStatus)
		_syncTimeouts.delete(id)
	}, SyncTimeoutDuration)

	_syncTimeouts.set(id, timeoutId)
}

// Function to set syncing status for a single ID
export const setSyncing = (id: SyncId) => {
	const newSyncStatus = [..._syncStatus.getValue()]
	if (!newSyncStatus.includes(id)) {
		newSyncStatus.push(id)
		_syncStatus.next(newSyncStatus)
	}

	// Start timeout for this ID
	startSyncTimeout(id)
}

// Function to set syncing status for multiple IDs
export const setSyncingMulti = (ids: SyncId[]) => {
	const newSyncStatus = [..._syncStatus.getValue()]
	ids.forEach((id) => {
		if (!newSyncStatus.includes(id)) {
			newSyncStatus.push(id)
		}
		// Start timeout for each ID
		startSyncTimeout(id)
	})
	_syncStatus.next(newSyncStatus)
}

// Function to remove a specific syncing ID
export const removeSyncing = (id: SyncId) => {
	// Clear timeout for this ID
	clearSyncTimeout(id)

	const newSyncStatus = _syncStatus.getValue().filter((syncId) => syncId !== id)
	_syncStatus.next(newSyncStatus)
}

export * from './default'
