// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getActivePool, getSyncIds, syncStatus$ } from 'global-bus'
import { getIdsFromSyncConfig } from 'global-bus/util'
import { useEffect, useState } from 'react'
import type { MaybeAddress, SyncConfig, SyncId } from 'types'
import { useBalances } from '../useBalances'

export const useSyncing = (config: SyncConfig = '*') => {
	const { getAccountBalance, getPoolMembership } = useBalances()

	// Retrieve the ids from the config provided
	const ids = getIdsFromSyncConfig(config)

	// Keep a record of active sync statuses
	const [syncIds, setSyncIds] = useState<SyncId[]>(getSyncIds(ids))

	// Helper to determine if active pools have synced
	const getPoolStatusSynced = (): boolean => {
		const POOL_SYNC_IDS: SyncId[] = [
			'initialization',
			'bonded-pools',
			'active-pools',
		]
		const activeSyncIds = syncIds.filter((syncId) =>
			POOL_SYNC_IDS.includes(syncId),
		)
		return activeSyncIds.length === 0
	}

	// Helper to determine if account data has been synced. Also requires initialization to be
	// completed
	const accountSynced = (address: MaybeAddress): boolean => {
		if (!address) {
			return !syncIds.includes('initialization')
		}
		// Only use data subscribed for every account here. Unbonded accounts never receive a staking
		// ledger, so it cannot be used as an account-ready signal.
		const { synced: poolMembershipSynced } = getPoolMembership(address)
		const { synced: accountBalanceSynced } = getAccountBalance(address)

		return (
			poolMembershipSynced &&
			accountBalanceSynced &&
			!syncIds.includes('initialization')
		)
	}

	// Helper to determine whether the account's active pool (if any) has synced. For syncing to have
	// finished, either the account is not in a pool, or the pool membership must be synced and the
	// active pool must exist.
	const activePoolSynced = (address: MaybeAddress): boolean => {
		const { synced, membership } = getPoolMembership(address)
		if (!synced) {
			return false
		}
		if (!membership) {
			return true
		}
		return !!getActivePool(membership.poolId)
	}

	// Subscribe to global bus
	useEffect(() => {
		const subSyncStatus = syncStatus$.subscribe(() =>
			setSyncIds(getSyncIds(ids)),
		)
		return () => subSyncStatus.unsubscribe()
	}, [])
	return {
		syncing: syncIds.length > 0,
		accountSynced,
		activePoolSynced,
		getPoolStatusSynced,
	}
}
