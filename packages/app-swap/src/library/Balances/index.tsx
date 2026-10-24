// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useTheme } from 'hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ButtonHeader } from 'ui-buttons'
import { Popover } from 'ui-core/popover'
import { BalancesPopover } from './BalancesPopover'

export const Wallet = () => {
	const { t } = useTranslation('swap')
	const { themeElementRef } = useTheme()
	const { activeAccount } = useActiveAccount()
	const { accounts, getAccount } = useImportedAccounts()
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(null)
	const account =
		accounts.find(
			(item) =>
				item.address === selectedAccount?.address &&
				item.source === selectedAccount?.source,
		) ??
		getAccount(activeAccount) ??
		accounts[0] ??
		null
	const [open, setOpen] = useState(false)

	return (
		<Popover
			open={open}
			portalContainer={themeElementRef.current || undefined}
			content={
				<BalancesPopover
					account={account}
					accounts={accounts}
					onSelect={setSelectedAccount}
					setOpen={setOpen}
				/>
			}
			onTriggerClick={() => setOpen(!open)}
			triggerLabel={t('balances')}
			width="min(42rem, calc(100vw - 1.5rem))"
		>
			<ButtonHeader className="header-wallet" icon={faWallet} />
		</Popover>
	)
}
