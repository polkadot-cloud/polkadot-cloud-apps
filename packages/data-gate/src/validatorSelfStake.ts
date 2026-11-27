// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useQuery } from '@tanstack/react-query'
import { getNetwork, getStakingLedger, stakingLedgers$ } from 'global-bus'
import { useSyncExternalStore } from 'react'
import { useDataGate } from './provider'

const subscribeToLedgers = (notify: () => void) => {
	const subscription = stakingLedgers$.subscribe(notify)
	return () => subscription.unsubscribe()
}

export const useValidatorSelfStake = (stash: string) => {
	const { node, ready } = useDataGate()
	const network = getNetwork()
	const getSubscribedTotal = () => getStakingLedger(stash).ledger?.total
	const subscribedTotal = useSyncExternalStore(
		subscribeToLedgers,
		getSubscribedTotal,
		getSubscribedTotal,
	)
	const enabled = ready && !!stash
	const query = useQuery({
		queryKey: ['validator-self-stake', network, stash],
		queryFn: () => node.query.stakingLedgerTotal(stash),
		enabled: enabled && subscribedTotal === undefined,
		staleTime: 60_000,
		retry: false,
	})
	return {
		data: enabled ? (subscribedTotal ?? query.data) : undefined,
		loading:
			!!stash && (!ready || (subscribedTotal === undefined && query.isPending)),
	}
}
