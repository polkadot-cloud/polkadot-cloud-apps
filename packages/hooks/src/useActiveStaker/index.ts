// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { fetchGetNominationStatus } from 'plugin-staking-api'
import type { StakerNominationStatus } from 'plugin-staking-api/types'
import { useEffect } from 'react'
import type { NetworkId } from 'types'
import { useActivePool } from '../useActivePool'
import { useNetwork } from '../useNetwork'
import { usePlugins } from '../usePlugins'
import { createSingletonStore, useSingletonStore } from '../util'
import type { ActiveStakerHookInterface } from './types'

export type { ActiveStakerHookInterface } from './types'

const defaultActiveStakerState: ActiveStakerHookInterface = {
	activePoolStatus: undefined,
	activeNominatorStatus: undefined,
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
	value: StakerNominationStatus | undefined,
) => {
	if (activeStakerStore.getSnapshot()[key] === value) {
		return
	}
	activeStakerStore.patchSnapshot({ [key]: value })
}

const getRequestKey = (network: NetworkId, who: string) => `${network}:${who}`

const clearNominatorData = () => {
	nominatorRequestId++
	nominatorRequestKey = null
	setActiveStakerValue('activeNominatorStatus', undefined)
}

const clearPoolData = () => {
	poolRequestId++
	poolRequestKey = null
	setActiveStakerValue('activePoolStatus', undefined)
}

const fetchNominatorStatus = async (network: NetworkId, who: string) => {
	const key = getRequestKey(network, who)
	if (nominatorRequestKey === key) {
		return
	}

	nominatorRequestKey = key
	const requestId = ++nominatorRequestId
	try {
		const result = await fetchGetNominationStatus(network, who)
		if (requestId === nominatorRequestId && nominatorRequestKey === key) {
			setActiveStakerValue('activeNominatorStatus', result)
		}
	} catch {
		if (requestId === nominatorRequestId && nominatorRequestKey === key) {
			setActiveStakerValue('activeNominatorStatus', undefined)
		}
	}
}

const fetchPoolStatus = async (network: NetworkId, who: string) => {
	const key = getRequestKey(network, who)
	if (poolRequestKey === key) {
		return
	}

	poolRequestKey = key
	const requestId = ++poolRequestId
	try {
		const result = await fetchGetNominationStatus(network, who)
		if (requestId === poolRequestId && poolRequestKey === key) {
			setActiveStakerValue('activePoolStatus', result)
		}
	} catch {
		if (requestId === poolRequestId && poolRequestKey === key) {
			setActiveStakerValue('activePoolStatus', undefined)
		}
	}
}

export const useActiveStaker = (): ActiveStakerHookInterface => {
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { activeAddress } = useActiveAccount()
	const { activePool } = useActivePool()
	const state = useSingletonStore(activeStakerStore)

	const stakingApiEnabled = pluginEnabled('staking_api')
	const poolStash = activePool?.addresses.stash

	useEffect(() => {
		if (!stakingApiEnabled || !activeAddress) {
			clearNominatorData()
			return
		}

		void fetchNominatorStatus(network, activeAddress)
	}, [stakingApiEnabled, network, activeAddress])

	useEffect(() => {
		if (!stakingApiEnabled || !poolStash) {
			clearPoolData()
			return
		}

		void fetchPoolStatus(network, poolStash)
	}, [stakingApiEnabled, network, poolStash])

	return state
}
