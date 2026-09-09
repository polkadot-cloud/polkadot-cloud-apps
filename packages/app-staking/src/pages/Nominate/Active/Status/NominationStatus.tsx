// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNominationStatus } from 'hooks/useNominationStatus'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'

export const NominationStatus = () => {
	const { t } = useTranslation('pages')
	const { activeAddress } = useActiveAccount()

	// Get the nomination status for the active account.
	const nominationStatus = useNominationStatus(activeAddress)

	return (
		<Stat
			label={t('status')}
			helpKey="Nomination Status"
			stat={nominationStatus.message}
		/>
	)
}
