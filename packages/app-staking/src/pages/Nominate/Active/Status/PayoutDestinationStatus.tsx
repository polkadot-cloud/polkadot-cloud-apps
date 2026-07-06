// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faGear, faWallet } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useBalances } from 'hooks/useBalances'
import { usePayeeConfig } from 'hooks/usePayeeConfig'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'

export const PayoutDestinationStatus = () => {
	const { t } = useTranslation('pages')
	const { syncing } = useSyncing()
	const { isBonding } = useStaking()
	const { openModal } = useOverlay().modal
	const { getStakingLedger } = useBalances()
	const { getPayeeItems } = usePayeeConfig()
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()

	const payee = getStakingLedger(activeAddress).payee

	// Get payee status text to display.
	const getPayeeStatus = () => {
		if (!isBonding) {
			return t('notAssigned')
		}
		const status = getPayeeItems(true).find(
			({ value }) => value === payee?.destination,
		)?.activeTitle

		if (status) {
			return status
		}
		return t('notAssigned')
	}

	// Get the payee destination icon to display, falling back to wallet icon.
	const payeeIcon = !isBonding
		? undefined
		: getPayeeItems(true).find(({ value }) => value === payee?.destination)
				?.icon || faWallet

	return (
		<Stat
			label={t('payoutDestination')}
			helpKey="Payout Destination"
			icon={payeeIcon}
			stat={getPayeeStatus()}
			buttons={
				isBonding && !isReadOnlyAccount(activeAddress)
					? [
							{
								title: t('update'),
								icon: faGear,
								disabled: syncing || !isBonding,
								onClick: () => openModal({ key: 'UpdatePayee', size: 'sm' }),
							},
						]
					: []
			}
		/>
	)
}
