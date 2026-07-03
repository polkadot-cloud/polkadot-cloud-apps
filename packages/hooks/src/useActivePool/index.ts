// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { activePools$, removeSyncing } from 'global-bus'
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import type { ActivePool } from 'types'
import { createObservableStore } from 'utils'
import { useApi } from '../useApi'
import { useBalances } from '../useBalances'
import { useNetwork } from '../useNetwork'
import { defaultPoolNominations } from './defaults'
import type { ActivePoolHookInterface } from './types'

export type { ActivePoolHookInterface } from './types'

const activePoolsStore = createObservableStore<ActivePool[]>(activePools$, [])

export const useActivePool = (): ActivePoolHookInterface => {
	const { isReady } = useApi()
	const { network } = useNetwork()
	const { getPoolMembership } = useBalances()
	const { activeAddress } = useActiveAccount()
	const { membership } = getPoolMembership(activeAddress)
	const didMountRef = useRef(false)

	const activePools = useSyncExternalStore(
		activePoolsStore.subscribe,
		activePoolsStore.getSnapshot,
		activePoolsStore.getSnapshot,
	)

	const accountPoolId = membership?.poolId

	const getActivePool = useCallback(
		(poolId: number) => activePools?.find((pool) => pool.id === poolId),
		[activePools],
	)

	const getPoolNominations = useCallback(
		(poolId: number) => {
			const pool = getActivePool(Number(poolId))
			return pool?.nominators
				? {
						targets: pool.nominators.targets,
						submittedIn: pool.nominators.submittedIn,
					}
				: defaultPoolNominations
		},
		[getActivePool],
	)

	const activePool = accountPoolId ? getActivePool(accountPoolId) : undefined
	const activePoolNominations = accountPoolId
		? getPoolNominations(accountPoolId)
		: null
	const isBonding = !!activePool

	const isNominator = useCallback(() => {
		const roles = activePool?.bondedPool?.roles
		if (!activeAddress || !roles) {
			return false
		}
		return activeAddress === roles?.nominator
	}, [activeAddress, activePool])

	const isOwner = useCallback(() => {
		const roles = activePool?.bondedPool?.roles
		if (!activeAddress || !roles) {
			return false
		}
		return activeAddress === roles?.root
	}, [activeAddress, activePool])

	const isMember = useCallback(() => {
		const p = activePool ? String(activePool.id) : '-1'
		return String(membership?.poolId || '') === p
	}, [activePool, membership])

	const inPool = !!(membership?.address === activeAddress)

	const isDepositor = useCallback(() => {
		const roles = activePool?.bondedPool?.roles
		if (!activeAddress || !roles) {
			return false
		}
		return activeAddress === roles?.depositor
	}, [activeAddress, activePool])

	const isBouncer = useCallback(() => {
		const roles = activePool?.bondedPool?.roles
		if (!activeAddress || !roles) {
			return false
		}
		return activeAddress === roles?.bouncer
	}, [activeAddress, activePool])

	const getPoolRoles = useCallback(
		() => ({
			depositor: activePool?.bondedPool?.roles?.depositor || '',
			nominator: activePool?.bondedPool?.roles?.nominator || '',
			root: activePool?.bondedPool?.roles?.root || '',
			bouncer: activePool?.bondedPool?.roles?.bouncer || '',
		}),
		[activePool],
	)

	const getPoolUnlocking = useCallback(
		() =>
			(membership?.unbondingEras || []).map(([era, value]) => ({
				era,
				value,
			})),
		[membership],
	)

	useEffect(() => {
		if (!didMountRef.current) {
			didMountRef.current = true
			return
		}
		if (isReady) {
			if (!membership) {
				removeSyncing('active-pools')
			} else if (activePools?.find((pool) => pool.id === membership.poolId)) {
				removeSyncing('active-pools')
			}
		}
	}, [network, isReady, membership, activePools])

	return {
		isNominator,
		inPool,
		isOwner,
		isMember,
		isDepositor,
		isBouncer,
		isBonding,
		getPoolUnlocking,
		getPoolRoles,
		activePool,
		activePoolNominations,
	}
}
