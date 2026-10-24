// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import type { BalancesOptions } from 'modals/Balances'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ButtonHeader } from 'ui-buttons'
import { useOverlay } from 'ui-overlay'

export const Wallet = () => {
	const { t } = useTranslation('swap')
	const { openModal } = useOverlay().modal
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(null)

	return (
		<button
			type="button"
			aria-label={t('balances')}
			onClick={() => {
				const options: BalancesOptions = {
					initialAccount: selectedAccount,
					onSelect: setSelectedAccount,
				}
				openModal({ key: 'Balances', size: 'sm', options })
			}}
		>
			<ButtonHeader className="header-wallet" icon={faWallet} />
		</button>
	)
}
