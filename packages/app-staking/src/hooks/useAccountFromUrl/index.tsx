// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { extractUrlValue } from '@w3ux/utils'
import { emitNotification } from 'global-bus'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const useAccountFromUrl = () => {
	const { t } = useTranslation('app')
	const { accounts } = useImportedAccounts()
	const { accountsInitialised } = useImportedAccounts()
	const { activeAddress, setActiveAccount } = useActiveAccount()

	// Set active account if url var present and accounts initialised
	useEffect(() => {
		if (accountsInitialised) {
			const val = extractUrlValue('a')
			if (val) {
				const account = accounts.find((a) => a.address === val)
				if (account && activeAddress !== val) {
					const { address, source } = account
					setActiveAccount({ address, source })

					emitNotification({
						title: t('accountConnected'),
						subtitle: `${t('connectedTo')} ${account.name}.`,
					})
				}
			}
		}
	}, [accountsInitialised])
}
