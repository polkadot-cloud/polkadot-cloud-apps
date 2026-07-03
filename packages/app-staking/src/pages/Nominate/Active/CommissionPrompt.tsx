// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { WarningPrompt } from 'library/WarningPrompt'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'

export const CommissionPrompt = () => {
	const { t } = useTranslation('pages')
	const { isBonding } = useStaking()
	const { getNominations } = useBalances()
	const { openCanvas } = useOverlay().canvas
	const { formatWithPrefs } = useValidators()
	const { activeAddress } = useActiveAccount()
	const { syncing } = useSyncing(['active-pools'])

	const nominated = formatWithPrefs(getNominations(activeAddress))
	const fullCommissionNominees = nominated.filter(
		(nominee) => nominee.prefs.commission === 100,
	)

	if (!fullCommissionNominees.length || !isBonding || syncing) {
		return null
	}

	return (
		<WarningPrompt
			title={t('fullCommissionValidatorTitle')}
			subtitle={t('fullCommissionValidatorSubtitle')}
			buttonText={`${t('manage', { ns: 'pages' })}`}
			onClick={() =>
				openCanvas({
					key: 'ManageNominations',
					scroll: false,
					options: {
						bondFor: 'nominator',
						nominator: activeAddress,
						nominated,
					},
				})
			}
		/>
	)
}
