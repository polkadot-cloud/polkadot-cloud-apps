// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { NominateDappName } from 'consts'
import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { hexToString } from 'dedot/utils'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { Editor } from 'library/ManageNominations/Editor'
import { useEffect, useState } from 'react'
import { Page } from 'ui-core/base'
import { StandaloneStatus } from './Wrappers'

const usePoolName = (poolId?: number) => {
	const { serviceApi } = useApi()
	const [poolName, setPoolName] = useState('')

	useEffect(() => {
		let mounted = true
		setPoolName('')

		if (poolId === undefined) {
			return () => {
				mounted = false
			}
		}

		void serviceApi.query
			.poolMetadataMulti([poolId])
			.then(([metadata]) => {
				if (mounted) {
					setPoolName(metadata ? hexToString(metadata) : '')
				}
			})
			.catch(() => {
				if (mounted) {
					setPoolName('')
				}
			})

		return () => {
			mounted = false
		}
	}, [poolId, serviceApi])

	return poolName
}

const Inner = ({
	accountStatus,
	bondFor,
	canManageNominations,
	eligibilityLoading,
	poolId,
}: {
	accountStatus: string | null
	bondFor: 'nominator' | 'pool'
	canManageNominations: boolean
	eligibilityLoading: boolean
	poolId?: number
}) => {
	return (
		<>
			<Page.Title title="Nominate">
				{!eligibilityLoading && accountStatus && (
					<StandaloneStatus>{accountStatus}</StandaloneStatus>
				)}
			</Page.Title>
			<Page.Row>
				<Editor
					bondFor={bondFor}
					canSubmit={canManageNominations}
					dappName={NominateDappName}
					displayFor="default"
					eligibilityLoading={eligibilityLoading}
					optimalSelectionOnly
					poolId={poolId}
					standaloneCards
				/>
			</Page.Row>
		</>
	)
}

export const NominateStandalone = () => {
	const { activeAddress } = useActiveAccount()
	const { getNominations } = useBalances()
	const { isBonding } = useStaking()
	const { accountSynced, activePoolSynced } = useSyncing()
	const { formatWithPrefs } = useValidators()
	const { activePool, activePoolNominations, isOwner } = useActivePool()
	const isPool = Boolean(activePool) && isOwner()
	const nominated = formatWithPrefs(
		isPool
			? (activePoolNominations?.targets ?? [])
			: getNominations(activeAddress),
	)
	const nominationsKey = nominated.map(({ address }) => address).join(':')
	const bondFor = isPool ? 'pool' : 'nominator'
	const poolId = isPool ? activePool?.id : undefined
	const poolName = usePoolName(poolId)
	const canManageNominations = Boolean(activeAddress) && (isPool || isBonding)
	const eligibilityLoading = Boolean(
		activeAddress &&
			(!accountSynced(activeAddress) || !activePoolSynced(activeAddress)),
	)
	const accountStatus = isPool
		? `Pool Owner · Pool ID ${poolId}${poolName ? ` · ${poolName}` : ''}`
		: isBonding
			? 'Actively Nominating'
			: null

	return (
		<ManageNominationsProvider
			key={`${activeAddress || 'disconnected'}:${bondFor}:${activePool?.id || ''}:${nominationsKey}`}
			nominations={nominated}
			initialMethod="Optimal Selection"
			provideNominationHealth={false}
		>
			<Inner
				accountStatus={accountStatus}
				bondFor={bondFor}
				canManageNominations={canManageNominations}
				eligibilityLoading={eligibilityLoading}
				poolId={poolId}
			/>
		</ManageNominationsProvider>
	)
}
