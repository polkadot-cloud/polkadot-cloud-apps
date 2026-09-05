// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { NominateDappName } from 'consts'
import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useValidators as useValidatorEntries } from 'contexts/Validators/ValidatorEntries'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useValidators } from 'hooks/useValidators'
import { Editor } from 'library/ManageNominations/Editor'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { StandaloneStatus } from './Wrappers'

export const NominateStandalone = () => {
	const { t } = useTranslation('app')
	const { accountSynced, activePoolSynced } = useSyncing()
	const { syncing: stakingLedgersSyncing } = useSyncing(['staking-ledgers'])
	const { getNominations } = useBalances()
	const { activeAddress } = useActiveAccount()
	const { isBonding, isNominator } = useStaking()
	const { formatWithPrefs } = useValidatorEntries()
	const { isLoading, isValidator } = useValidators()
	const { accountsInitialised } = useImportedAccounts()
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
	const canManageNominations =
		Boolean(activeAddress) &&
		(isPool || (isBonding && !isValidator(activeAddress)))

	const eligibilityLoading = Boolean(
		activeAddress &&
			(!accountSynced(activeAddress) ||
				!activePoolSynced(activeAddress) ||
				stakingLedgersSyncing ||
				isLoading(activeAddress)),
	)
	const accountStatus = !accountsInitialised
		? t('syncingAccounts')
		: !activeAddress
			? t('noAccountSelected')
			: eligibilityLoading
				? t('syncingAccounts')
				: isPool && poolId !== undefined
					? t(poolName ? 'poolOwnerStatusWithName' : 'poolOwnerStatus', {
							poolId,
							poolName,
						})
					: activelyNominating
						? t('activelyNominating')
						: t('notANominator')

	const statusIndicator =
		accountsInitialised && activeAddress && !eligibilityLoading && !isPool
			? activelyNominating
				? 'active'
				: 'inactive'
			: undefined

	return (
		<>
			<Page.Title title={t('nominate')}>
				<StandaloneStatus $indicator={statusIndicator}>
					{accountStatus}
				</StandaloneStatus>
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
						ineligibleStatus={
							isValidator(activeAddress) ? 'validator' : 'notStaking'
						}
						optimalSelectionOnly
						poolId={poolId}
						standaloneCards
					/>
				</ManageNominationsProvider>
			</Page.Row>
		</>
	)
}
