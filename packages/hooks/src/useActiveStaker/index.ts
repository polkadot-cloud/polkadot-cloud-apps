// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { fetchGetStakerWithNominees } from 'plugin-staking-api'
import type { ActiveStatusWithNominees } from 'plugin-staking-api/types'
import { useEffect } from 'react'
import type { NetworkId } from 'types'
import { useActivePool } from '../useActivePool'
import { useApi } from '../useApi'
import { useBalances } from '../useBalances'
import { useNetwork } from '../useNetwork'
import { usePlugins } from '../usePlugins'
import { createSingletonStore, useSingletonStore } from '../util'
import type { ActiveStakerHookInterface } from './types'

export type { ActiveStakerHookInterface } from './types'

const defaultActiveStakerState: ActiveStakerHookInterface = {
	activePoolData: undefined,
	activeNominatorData: undefined,
}

type ActiveStakerStateKey = keyof ActiveStakerHookInterface

const activeStakerStore = createSingletonStore<ActiveStakerHookInterface>(
	defaultActiveStakerState,
)
let nominatorRequestKey: string | null = null
let poolRequestKey: string | null = null
let nominatorRequestId = 0
let poolRequestId = 0

const setActiveStakerValue = (
	key: ActiveStakerStateKey,
	value: ActiveStatusWithNominees | undefined,
) => {
	if (activeStakerStore.getSnapshot()[key] === value) {
		return
	}
	activeStakerStore.patchSnapshot({ [key]: value })
}

const getRequestKey = (
	network: NetworkId,
	era: number,
	who: string,
	targets: string[],
	extra = '',
) => `${network}:${era}:${who}:${extra}:${targets.join('|')}`

const clearNominatorData = () => {
	nominatorRequestId++
	nominatorRequestKey = null
	setActiveStakerValue('activeNominatorData', undefined)
}

const clearPoolData = () => {
	poolRequestId++
	poolRequestKey = null
	setActiveStakerValue('activePoolData', undefined)
}

const fetchNominatorStatus = async (
	network: NetworkId,
	era: number,
	who: string,
	targets: string[],
) => {
	const key = getRequestKey(network, era, who, targets)
	if (nominatorRequestKey === key) {
		return
	}

	nominatorRequestKey = key
	const requestId = ++nominatorRequestId
	try {
		const result = await fetchGetStakerWithNominees(network, era, who, targets)
		if (requestId === nominatorRequestId && nominatorRequestKey === key) {
			setActiveStakerValue('activeNominatorData', result)
		}
	} catch {
		if (requestId === nominatorRequestId && nominatorRequestKey === key) {
			setActiveStakerValue('activeNominatorData', undefined)
		}
	}
}

const fetchPoolStatus = async (
	network: NetworkId,
	era: number,
	who: string,
	targets: string[],
	activeAddress: string,
) => {
	const key = getRequestKey(network, era, who, targets, activeAddress)
	if (poolRequestKey === key) {
		return
	}

	poolRequestKey = key
	const requestId = ++poolRequestId
	try {
		const result = await fetchGetStakerWithNominees(network, era, who, targets)
		if (requestId === poolRequestId && poolRequestKey === key) {
			setActiveStakerValue('activePoolData', result)
		}
	} catch {
		if (requestId === poolRequestId && poolRequestKey === key) {
			setActiveStakerValue('activePoolData', undefined)
		}
	}
}

export const useActiveStaker = (): ActiveStakerHookInterface => {
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { getNominations } = useBalances()
	const { activeAddress } = useActiveAccount()
	const { activePool, activePoolNominations } = useActivePool()
	const state = useSingletonStore(activeStakerStore)

	const stakingApiEnabled = pluginEnabled('staking_api')
	const nominations = getNominations(activeAddress)
	const poolNominations = activePoolNominations?.targets || []
	const nominationsKey = nominations.join('|')
	const poolNominationsKey = poolNominations.join('|')
	const poolStash = activePool?.addresses.stash

	useEffect(() => {
		if (
			!stakingApiEnabled ||
			activeEra.index === 0 ||
			!activeAddress ||
			!nominations.length
		) {
			clearNominatorData()
			return
		}

		void fetchNominatorStatus(
			network,
			activeEra.index,
			activeAddress,
			nominations,
		)
	}, [
		stakingApiEnabled,
		network,
		activeEra.index,
		activeAddress,
		nominationsKey,
	])

	useEffect(() => {
		if (
			!stakingApiEnabled ||
			activeEra.index === 0 ||
			!activeAddress ||
			!poolStash ||
			!poolNominations.length
		) {
			clearPoolData()
			return
		}

		void fetchPoolStatus(
			network,
			activeEra.index,
			poolStash,
			poolNominations,
			activeAddress,
		)
	}, [
		stakingApiEnabled,
		network,
		activeEra.index,
		activeAddress,
		poolStash,
		poolNominationsKey,
	])

	return state
}
