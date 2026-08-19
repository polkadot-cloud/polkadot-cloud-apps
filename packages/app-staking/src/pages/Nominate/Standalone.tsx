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
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { StandaloneStatus } from './Wrappers'

export const NominateStandalone = () => {
	const { t } = useTranslation('app')
	const { activeAddress } = useActiveAccount()
	const { getNominations } = useBalances()
	const { isBonding, isNominator } = useStaking()
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
	const poolName = isPool ? activePool?.metadata : undefined
	const activelyNominating = !isPool && isNominator
	const canManageNominations = Boolean(activeAddress) && (isPool || isBonding)
	const eligibilityLoading = Boolean(
		activeAddress &&
			(!accountSynced(activeAddress) || !activePoolSynced(activeAddress)),
	)
	const accountStatus =
		isPool && poolId !== undefined
			? t(poolName ? 'poolOwnerStatusWithName' : 'poolOwnerStatus', {
					poolId,
					poolName,
				})
			: activelyNominating
				? t('activelyNominating')
				: null

	return (
		<>
			<Page.Title title={t('nominate')}>
				{!eligibilityLoading && accountStatus && (
					<StandaloneStatus $active={activelyNominating}>
						{accountStatus}
					</StandaloneStatus>
				)}
			</Page.Title>
			<Page.Row>
				<ManageNominationsProvider
					key={`${activeAddress || 'disconnected'}:${bondFor}:${activePool?.id || ''}:${nominationsKey}`}
					nominations={nominated}
					initialMethod="Optimal Selection"
					provideNominationHealth={false}
				>
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
				</ManageNominationsProvider>
			</Page.Row>
		</>
	)
}
