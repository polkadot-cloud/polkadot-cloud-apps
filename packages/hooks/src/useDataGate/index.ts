// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { getStakingChainData } from 'consts/util'
import type { DataModule } from 'data-gate'
import { DataGateProvider, useDataGate, useDataResource } from 'data-gate/react'
import { poolWarnings } from 'data-gate/resources/pools'
import {
	onlineStatus$,
	resetPoolWarnings,
	setPoolWarningsBatch,
	uids$,
} from 'global-bus'
import { createElement, type ReactNode, useEffect } from 'react'
import { useApi } from '../useApi'
import { useErasPerDay } from '../useErasPerDay'
import { useNetwork } from '../useNetwork'
import { usePlugins } from '../usePlugins'

// App integration only. All resource policy, fetching and request state live in data-gate.
export const AppDataGate = ({
	children,
	modules,
}: {
	children: ReactNode
	modules: readonly DataModule[]
}) => {
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { activeEra, serviceApi, isReady } = useApi()
	const { erasPerDay } = useErasPerDay()
	const { ss58, units } = getStakingChainData(network)
	return createElement(
		DataGateProvider,
		{
			network,
			apiEnabled: pluginEnabled('staking_api'),
			era: activeEra.index,
			node: serviceApi,
			nodeReady: isReady,
			ss58,
			units,
			erasPerDay,
			modules,
		},
		createElement(AppDataEvents, null, children),
	)
}

// App events are inputs to the gate. The package has no dependency on global stores or accounts.
const AppDataEvents = ({ children }: { children?: ReactNode }) => {
	const gate = useDataGate()
	const { accounts } = useImportedAccounts()
	const addresses = accounts.map(({ address }) => address)
	const warnings = useDataResource(poolWarnings(addresses))
	useEffect(() => {
		resetPoolWarnings()
		if (warnings.data)
			setPoolWarningsBatch(
				Object.fromEntries(
					addresses.map((address) => [
						address,
						warnings.data?.warnings
							.filter((warning) => warning.address === address)
							.flatMap((warning) =>
								warning.warningTypes.map((type) => ({
									address,
									poolId: warning.poolId,
									type,
								})),
							) ?? [],
					]),
				),
			)
	}, [warnings.data])
	useEffect(() => {
		let wasOnline = true
		let pending = new Set<number>()
		const online = onlineStatus$.subscribe(({ online }) => {
			if (online && !wasOnline) gate.invalidate()
			wasOnline = online
		})
		const transactions = uids$.subscribe((items) => {
			const next = new Set(
				items
					.filter(
						(item) => item.network === gate.config.network && item.pending,
					)
					.map(({ uid }) => uid),
			)
			if ([...pending].some((uid) => !next.has(uid)))
				gate.invalidate([
					'nominationStatuses',
					'nominationBacking',
					'poolDirectory',
					'poolNominations',
					'poolMembers',
					'poolMemberDetails',
					'poolWarnings',
					'rewards',
				])
			pending = next
		})
		return () => {
			online.unsubscribe()
			transactions.unsubscribe()
			resetPoolWarnings()
		}
	}, [gate])
	return children
}
