// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountsOptions } from 'modals/Accounts'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ButtonAccount } from 'ui-buttons'
import { useOverlay } from 'ui-overlay'

export const AccountsButton = () => {
	const { t } = useTranslation('app')
	const { openModal } = useOverlay().modal
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(null)

	return (
		<ButtonAccount.Standalone
			label={t('accounts')}
			onClick={() => {
				const options: AccountsOptions = {
					initialAccount: selectedAccount,
					onSelect: setSelectedAccount,
				}
				openModal({ key: 'Accounts', size: 'lg', options })
			}}
		/>
	)
}
