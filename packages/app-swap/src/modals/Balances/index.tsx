// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { BalancesView } from 'library/Balances/BalancesView'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ModalTitle } from 'ui-app/ModalTitle'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export type BalancesOptions = {
	initialAccount: ImportedAccount | null
	onSelect: (account: ImportedAccount | null) => void
}

export const Balances = () => {
	const { t } = useTranslation('swap')
	const { options } = useOverlay().modal.config
	const { initialAccount, onSelect } = options as BalancesOptions
	const { activeAccount } = useActiveAccount()
	const { accounts, getAccount } = useImportedAccounts()
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(initialAccount)
	const account =
		accounts.find(
			(item) =>
				item.address === selectedAccount?.address &&
				item.source === selectedAccount?.source,
		) ??
		getAccount(activeAccount) ??
		accounts[0] ??
		null

	return (
		<>
			<ModalTitle title={t('balances')} />
			<Padding horizontalOnly style={{ paddingBottom: '1.5rem' }}>
				<BalancesView
					account={account}
					accounts={accounts}
					onSelect={(nextAccount) => {
						setSelectedAccount(nextAccount)
						onSelect(nextAccount)
					}}
				/>
			</Padding>
		</>
	)
}
