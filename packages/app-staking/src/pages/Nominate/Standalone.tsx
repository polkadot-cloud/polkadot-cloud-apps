// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { NominateDappName } from 'consts'
import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { Editor } from 'library/ManageNominations/Editor'
import { Page } from 'ui-core/base'

const Inner = ({
	bondFor,
	canManageNominations,
	eligibilityLoading,
	poolId,
}: {
	bondFor: 'nominator' | 'pool'
	canManageNominations: boolean
	eligibilityLoading: boolean
	poolId?: number
}) => {
	return (
		<>
			<Page.Title title="Nominate" />
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
	const canManageNominations = Boolean(activeAddress) && (isPool || isBonding)
	const eligibilityLoading = Boolean(
		activeAddress &&
			(!accountSynced(activeAddress) || !activePoolSynced(activeAddress)),
	)

	return (
		<ManageNominationsProvider
			key={`${activeAddress || 'disconnected'}:${bondFor}:${activePool?.id || ''}:${nominationsKey}`}
			nominations={nominated}
			initialMethod="Optimal Selection"
			provideNominationHealth={false}
		>
			<Inner
				bondFor={bondFor}
				canManageNominations={canManageNominations}
				eligibilityLoading={eligibilityLoading}
				poolId={isPool ? activePool?.id : undefined}
			/>
		</ManageNominationsProvider>
	)
}
