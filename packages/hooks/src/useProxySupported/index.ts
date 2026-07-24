// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	isSupportedProxyCall,
	type ProxyRecord,
	proxies$,
} from '@polkadot-cloud/connect-proxies'
import { UnsupportedIfUniqueController } from 'consts/proxies'
import type { SubmittableExtrinsic } from 'dedot'
import { useSyncExternalStore } from 'react'
import type { ActiveProxy, MaybeAddress } from 'types'
import { createObservableStore } from 'utils'
import { useBalances } from '../useBalances'

const proxiesStore = createObservableStore<Record<string, ProxyRecord>>(
	proxies$,
	{},
)

export const useProxySupported = () => {
	const { getStakingLedger } = useBalances()
	const proxies = useSyncExternalStore(
		proxiesStore.subscribe,
		proxiesStore.getSnapshot,
		proxiesStore.getSnapshot,
	)

	// Check if the controller account of sender is unmigrated
	const unmigratedController = (c: string, f: MaybeAddress) => {
		const { controllerUnmigrated } = getStakingLedger(f)
		return UnsupportedIfUniqueController.includes(c) && controllerUnmigrated
	}

	// Determine whether the provided tx is proxy supported
	const isProxySupported = (
		tx: SubmittableExtrinsic | undefined,
		delegator: MaybeAddress,
		proxy: ActiveProxy | null,
	) => {
		const proxyDelegate =
			delegator && proxy
				? proxies[delegator]?.proxies.find(
						({ delegate }) => delegate === proxy.address,
					)
				: null
		if (!tx || !proxyDelegate) {
			return false
		}

		// if already wrapped in a proxy call, return early
		if (tx.call.pallet === 'Proxy' && tx.call.palletCall.name === 'Proxy') {
			return true
		}

		const proxyType = proxyDelegate.proxyType
		const pallet: string = tx.call.pallet
		const method: string = tx.call.palletCall.name
		const call = `${pallet}.${method}`

		// If a batch call, test if every inner call is a supported proxy call
		if (call === 'Utility.Batch') {
			return (tx.call.palletCall.params.calls || [])
				.map((c: { pallet: string; palletCall: { name: string } }) => ({
					pallet: c.pallet,
					method: c.palletCall.name,
				}))
				.every(
					(c: { pallet: string; method: string }) =>
						(isSupportedProxyCall(proxyType, c.pallet, c.method) ||
							(c.pallet === 'Proxy' && c.method === 'Proxy')) &&
						!unmigratedController(`${c.pallet}.${c.method}`, delegator),
				)
		}

		// Check if the non-batch call is a supported proxy call
		return (
			isSupportedProxyCall(proxyType, pallet, method) &&
			!unmigratedController(call, delegator)
		)
	}

	return {
		isProxySupported,
	}
}
