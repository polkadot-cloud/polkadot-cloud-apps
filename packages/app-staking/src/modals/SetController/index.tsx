// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ActionItem, Padding, Title } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const SetController = () => {
	const { t } = useTranslation('app')
	const { serviceApi } = useApi()
	const { isBonding } = useStaking()
	const { activeProxy } = useActiveProxy()
	const { getStakingLedger } = useBalances()
	const { closeModal } = useOverlay().modal
	const { syncing, accountSynced } = useSyncing()
	const { isReadOnlyAccount } = useImportedAccounts()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { controllerUnmigrated } = getStakingLedger(activeAddress)

	const canDeprecateController =
		isBonding &&
		!syncing &&
		accountSynced(activeAddress) &&
		controllerUnmigrated &&
		!isReadOnlyAccount(activeAddress)

	const getTx = () => {
		if (!activeAddress || !canDeprecateController) {
			return
		}
		return serviceApi.tx.setController()
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackSubmit: () => {
			closeModal()
		},
	})

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('migrateController')}</Title>
				<ActionItem text={t('migrateToStash')} />
				<p>{t('migrateControllerDescription')}</p>
			</Padding>
			<SubmitTx requiresMigratedController valid={true} {...submitExtrinsic} />
		</>
	)
}
