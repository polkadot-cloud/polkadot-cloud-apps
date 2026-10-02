// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useStandaloneAccount } from 'pages/Nominate/useStandaloneAccount'
import { useTranslation } from 'react-i18next'
import classes from './index.module.scss'

export const AccountStatus = () => {
	const { t } = useTranslation('app')
	const {
		activeAddress,
		accountsInitialised,
		activePool,
		isPool,
		activelyNominating,
		eligibilityLoading,
	} = useStandaloneAccount()

	let accountStatus: string
	let compactStatus: string

	if (!accountsInitialised || eligibilityLoading) {
		accountStatus = t('syncingAccounts')
		compactStatus = t('syncing')
	} else if (!activeAddress) {
		accountStatus = t('noAccountSelected')
		compactStatus = t('disconnected')
	} else if (isPool && activePool) {
		accountStatus = t(
			activePool.metadata ? 'poolOwnerStatusWithName' : 'poolOwnerStatus',
			{ poolId: activePool.id, poolName: activePool.metadata },
		)
		compactStatus = `${t('pool')} #${activePool.id}`
	} else {
		accountStatus = t(
			activelyNominating ? 'activelyNominating' : 'notANominator',
		)
		compactStatus = t(activelyNominating ? 'nominator' : 'inactive')
	}

	return (
		<div
			className={classes.status}
			title={accountStatus}
			role="status"
			aria-label={accountStatus}
		>
			<span className={classes.full} aria-hidden="true">
				{accountStatus}
			</span>
			<span className={classes.compact} aria-hidden="true">
				{compactStatus}
			</span>
		</div>
	)
}
