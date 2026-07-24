// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { unitToPlanck } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useCallback, useEffect } from 'react'
import type { MaybeAddress } from 'types'
import { useNetwork } from '../useNetwork'
import { createSingletonStore, useSingletonStore } from '../util'
import { defaultPoolProgress } from './defaults'
import { getLocalPoolSetups, setLocalPoolSetups } from './local'
import type {
	PoolProgress,
	PoolSetup,
	PoolSetups,
	PoolSetupsHookInterface,
} from './types'

export { defaultPoolProgress } from './defaults'
export type {
	PoolProgress,
	PoolSetup,
	PoolSetups,
	PoolSetupsHookInterface,
} from './types'

const serverPoolSetupsSnapshot: PoolSetups = {}
const poolSetupsStore = createSingletonStore<PoolSetups>(getLocalPoolSetups, {
	serverSnapshot: serverPoolSetupsSnapshot,
})

const getPoolSetupsSnapshot = poolSetupsStore.getSnapshot

const setPoolSetups = (setups: PoolSetups) => {
	setLocalPoolSetups(setups)
	poolSetupsStore.setSnapshot(setups)
}

const syncPoolSetups = () => {
	const localSetups = getLocalPoolSetups()
	if (
		JSON.stringify(poolSetupsStore.getSnapshot()) !==
		JSON.stringify(localSetups)
	) {
		poolSetupsStore.setSnapshot(localSetups)
	}
}

const getDefaultPoolSetup = (): PoolSetup => ({
	progress: defaultPoolProgress,
	section: 1,
})

const updateSetups = (
	all: PoolSetups,
	progress: PoolProgress,
	address: string,
	maybeSection?: number,
) => {
	const current = { ...(all[address] || {}) }
	const section = maybeSection ?? current.section ?? 1

	all[address] = {
		...current,
		progress,
		section,
	}
	return all
}

const hasPositiveBond = (bond: string, units: number): boolean => {
	try {
		return BigInt(unitToPlanck(bond || '0', units).toString()) > 0n
	} catch {
		return false
	}
}

export const usePoolSetups = (): PoolSetupsHookInterface => {
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()
	const { accounts, stringifiedAccountsKey } = useImportedAccounts()
	const { units } = getStakingChainData(network)
	const poolSetups = useSingletonStore(poolSetupsStore)

	const getPoolSetup = useCallback(
		(address: MaybeAddress): PoolSetup => {
			return address
				? poolSetups[address] || getDefaultPoolSetup()
				: getDefaultPoolSetup()
		},
		[poolSetups],
	)

	const setPoolSetup = useCallback(
		(progress: PoolProgress) => {
			if (!activeAddress) {
				return
			}
			setPoolSetups(
				updateSetups({ ...getPoolSetupsSnapshot() }, progress, activeAddress),
			)
		},
		[activeAddress],
	)

	const removePoolSetup = useCallback((address: MaybeAddress) => {
		setPoolSetups(
			Object.fromEntries(
				Object.entries(getPoolSetupsSnapshot()).filter(
					([key]) => key !== address,
				),
			),
		)
	}, [])

	const getPoolSetupPercent = useCallback(
		(address: MaybeAddress) => {
			if (!address) {
				return 0
			}
			const { progress } = getPoolSetup(address)

			const p = 25
			let percentage = 0
			if (progress.metadata !== '') {
				percentage += p
			}
			if (hasPositiveBond(progress?.bond || '0', units)) {
				percentage += p
			}
			if (progress.nominations.length) {
				percentage += p
			}
			if (progress.roles !== null) {
				percentage += p - 1
			}
			return percentage
		},
		[getPoolSetup, units],
	)

	const setPoolSetupSection = useCallback(
		(section: number) => {
			if (!activeAddress) {
				return
			}
			const poolSetupsSnapshot = getPoolSetupsSnapshot()
			setPoolSetups(
				updateSetups(
					{ ...poolSetupsSnapshot },
					poolSetupsSnapshot[activeAddress]?.progress ?? defaultPoolProgress,
					activeAddress,
					section,
				),
			)
		},
		[activeAddress],
	)

	useEffect(() => {
		if (accounts.length) {
			syncPoolSetups()
		}
	}, [activeAddress, accounts.length, network, stringifiedAccountsKey])

	return {
		getPoolSetup,
		setPoolSetup,
		removePoolSetup,
		getPoolSetupPercent,
		setPoolSetupSection,
	}
}
