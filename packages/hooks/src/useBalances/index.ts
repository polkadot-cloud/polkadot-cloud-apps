// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { getStakingChain, getStakingChainData } from 'consts/util'
import {
	accountBalances$,
	defaultAccountBalance,
	defaultPoolMembership,
	defaultStakingLedger,
	poolMemberships$,
	stakingLedgers$,
} from 'global-bus'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type {
	AccountBalance,
	MaybeAddress,
	PoolMembershipState,
	StakingLedger,
} from 'types'
import { createObservableStore } from 'utils'
import { useApi } from '../useApi'
import { useNetwork } from '../useNetwork'
import { createSingletonSignal } from '../util'
import type { BalancesHookInterface } from './types'
import { getLocalFeeReserve, setLocalFeeReserve } from './util'

export type { BalancesHookInterface } from './types'

type StateBalances = Record<string, Record<string, AccountBalance>>
type StateLedgers = Record<string, StakingLedger>
type PoolMemberships = Record<string, PoolMembershipState>

const accountBalancesStore = createObservableStore<StateBalances>(
	accountBalances$,
	{},
)
const stakingLedgersStore = createObservableStore<StateLedgers>(
	stakingLedgers$,
	{},
)
const poolMembershipsStore = createObservableStore<PoolMemberships>(
	poolMemberships$,
	{},
)

const feeReserveSignal = createSingletonSignal()

export const useBalances = (): BalancesHookInterface => {
	const { network } = useNetwork()
	const { getChainSpec } = useApi()
	const stakingChain = getStakingChain(network)
	const { activeAddress } = useActiveAccount()
	const { existentialDeposit } = getChainSpec(stakingChain)
	const { units, defaultFeeReserve } = getStakingChainData(network)

	const accountBalances = useSyncExternalStore(
		accountBalancesStore.subscribe,
		accountBalancesStore.getSnapshot,
		accountBalancesStore.getSnapshot,
	)
	const stakingLedgers = useSyncExternalStore(
		stakingLedgersStore.subscribe,
		stakingLedgersStore.getSnapshot,
		stakingLedgersStore.getSnapshot,
	)
	const poolMemberships = useSyncExternalStore(
		poolMembershipsStore.subscribe,
		poolMembershipsStore.getSnapshot,
		poolMembershipsStore.getSnapshot,
	)
	const feeReserve = useSyncExternalStore(
		feeReserveSignal.subscribe,
		() =>
			getLocalFeeReserve(activeAddress, defaultFeeReserve, {
				network,
				units,
			}),
		() => defaultFeeReserve,
	)

	const setFeeReserveBalance = useCallback(
		(amount: bigint) => {
			if (!activeAddress) {
				return
			}
			setLocalFeeReserve(activeAddress, amount, network)
			feeReserveSignal.emit()
		},
		[activeAddress, network],
	)

	const getAccountBalance = useCallback(
		(address: MaybeAddress) => {
			if (!address) {
				return defaultAccountBalance
			}
			return accountBalances?.[stakingChain]?.[address] || defaultAccountBalance
		},
		[accountBalances, stakingChain],
	)

	const getEdReserved = useCallback(
		() => existentialDeposit,
		[existentialDeposit],
	)

	const getStakingLedger = useCallback(
		(address: MaybeAddress) => {
			if (!address) {
				return defaultStakingLedger
			}
			return stakingLedgers?.[address] || defaultStakingLedger
		},
		[stakingLedgers],
	)

	const getPoolMembership = useCallback(
		(address: MaybeAddress): PoolMembershipState => {
			if (!address) {
				return defaultPoolMembership
			}
			return poolMemberships?.[address] || defaultPoolMembership
		},
		[poolMemberships],
	)

	const getNominations = useCallback(
		(address: MaybeAddress) => {
			if (!address) {
				return []
			}
			const { nominators } = getStakingLedger(address)
			return nominators?.targets || []
		},
		[getStakingLedger],
	)

	const getPendingPoolRewards = useCallback(
		(address: MaybeAddress) => {
			if (!address) {
				return 0n
			}
			return getPoolMembership(address).membership?.pendingRewards || 0n
		},
		[getPoolMembership],
	)

	useEffect(() => {
		feeReserveSignal.emit()
	}, [activeAddress, network])

	return {
		getAccountBalance,
		getStakingLedger,
		getPoolMembership,
		getNominations,
		getEdReserved,
		getPendingPoolRewards,
		feeReserve,
		setFeeReserveBalance,
	}
}
