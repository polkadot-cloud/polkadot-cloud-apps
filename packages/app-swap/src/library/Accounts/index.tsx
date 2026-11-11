// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch } from 'react-router-dom'
import type { ImportedAccount } from 'types'
import { Account, type HeaderAccountProps } from 'ui-app/Headers'
import { ButtonAccount } from 'ui-buttons'
import type { AccountBalancesOptions } from 'ui-modals/AccountBalances'
import { useOverlay } from 'ui-overlay'
import classes from './index.module.scss'

export const AccountsButton = (props: HeaderAccountProps) => {
	const { t } = useTranslation('app')
	const { openModal } = useOverlay().modal
	const isLiquidity = !!useMatch('/liquidity/*')
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(null)

	return (
		<div
			key={isLiquidity ? 'active-account' : 'accounts'}
			className={classes.control}
		>
			{isLiquidity ? (
				<Account {...props} />
			) : (
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
			)}
		</div>
	)
}
