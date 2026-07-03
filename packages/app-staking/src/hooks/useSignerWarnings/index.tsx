// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useSignerAvailable } from 'hooks/useSignerAvailable'
import { useTranslation } from 'react-i18next'
import type { ActiveAccount } from 'types'

export const useSignerWarnings = () => {
	const { t } = useTranslation('modals')
	const { activeProxy } = useActiveProxy()
	const { signerAvailable } = useSignerAvailable()
	const { accountHasSigner } = useImportedAccounts()

	const getSignerWarnings = (
		account: ActiveAccount,
		controller = false,
		proxySupported = false,
	) => {
		const warnings = []

		if (controller) {
			switch (signerAvailable(account, proxySupported)) {
				case 'controller_not_migrated':
					warnings.push(`${t('controllerNotMigrated')}`)
					break
				case 'read_only':
					warnings.push(`${t('readOnlyCannotSign')}`)
					break
				default:
					break
			}
		} else if (
			!(
				accountHasSigner(account) ||
				(accountHasSigner(activeProxy) && proxySupported)
			)
		) {
			warnings.push(`${t('readOnlyCannotSign')}`)
		}

		return warnings
	}

	return { getSignerWarnings }
}
