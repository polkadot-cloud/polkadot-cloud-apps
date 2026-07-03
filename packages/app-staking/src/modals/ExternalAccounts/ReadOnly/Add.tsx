// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useExternalAccounts } from '@polkadot-cloud/connect'
import { AccountDropdown } from 'library/AccountDropdown'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ButtonSecondary } from 'ui-buttons'
import { Padding } from 'ui-core/modal'

export const Add = () => {
	const { t } = useTranslation('modals')
	const { addReadOnlyAccount } = useExternalAccounts()

	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(null)

	const handleSubmit = async () => {
		if (selectedAccount) {
			const result = addReadOnlyAccount(selectedAccount.address)
			// Reset state on successful import
			if (result) {
				setSelectedAccount(null)
			}
		}
	}
	return (
		<Padding verticalOnly>
			<AccountDropdown
				accounts={[]}
				placeholder={t('inputAddress')}
				label={t('address', { ns: 'app' })}
				initialAccount={selectedAccount}
				onSelect={(account) => {
					setSelectedAccount(account)
				}}
			/>
			<div style={{ marginTop: '1rem' }}>
				<ButtonSecondary
					text={t('submit')}
					disabled={!selectedAccount}
					onClick={handleSubmit}
				/>
			</div>
		</Padding>
	)
}
