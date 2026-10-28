// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ButtonAccount } from 'ui-buttons'
import type { AccountBalancesOptions } from 'ui-modals/AccountBalances'
import { useOverlay } from 'ui-overlay'

export const AccountsButton = () => {
	const { t } = useTranslation('app')
	const { openModal } = useOverlay().modal
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(null)

	return (
		<ButtonAccount.Standalone
			label={t('accounts')}
			showChevron={false}
			onClick={() => {
				const options: AccountBalancesOptions = {
					initialAccount: selectedAccount,
					onSelect: setSelectedAccount,
				}
				openModal({ key: 'AccountBalances', size: 'lg', options })
			}}
		/>
	)
}
