// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNominationStatus } from 'hooks/useNominationStatus'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'

export const NominationStatus = () => {
	const { t } = useTranslation('pages')
	const { activeAddress } = useActiveAccount()
	const { getNominationStatus } = useNominationStatus()

	const nominationStatus = getNominationStatus(activeAddress, 'nominator')

	return (
		<Stat
			label={t('status')}
			helpKey="Nomination Status"
			stat={nominationStatus.message}
		/>
	)
}
