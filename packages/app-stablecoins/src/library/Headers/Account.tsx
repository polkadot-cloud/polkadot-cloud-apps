// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useTheme } from 'hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonAccount } from 'ui-buttons'
import { Popover } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import { AccountPopover } from './Popovers/AccountPopover'
import type { ToggleConnectProps } from './Popovers/types'

export const Account = ({ setOpenConnect }: ToggleConnectProps) => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const { openModal } = useOverlay().modal
	const { activeAccount, activeAddress } = useActiveAccount()
	const { accountHasSigner, getAccount, accounts } = useImportedAccounts()

	const [open, setOpen] = useState<boolean>(false)

	const totalImportedAccounts = accounts.length

	return !activeAddress ? (
		<ButtonAccount.Standalone
			label={totalImportedAccounts ? t('selectAccount') : t('connectAccounts')}
			onClick={() => {
				if (!totalImportedAccounts) {
					setOpenConnect(true)
				} else {
					openModal({ key: 'Accounts' })
				}
			}}
		/>
	) : (
		<Popover
			open={open}
			portalContainer={themeElementRef.current || undefined}
			content={<AccountPopover setOpen={setOpen} />}
			onTriggerClick={() => {
				if (!totalImportedAccounts) {
					return
				}
				if (activeAddress) {
					setOpen(!open)
				} else {
					openModal({ key: 'Accounts' })
				}
			}}
		>
			<ButtonAccount.Label
				className="header-account"
				activeAccount={getAccount(activeAccount)}
				readOnly={!accountHasSigner(activeAccount)}
				open={open}
			/>
		</Popover>
	)
}
