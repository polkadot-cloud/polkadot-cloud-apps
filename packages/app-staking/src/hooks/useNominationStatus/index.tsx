// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useNominationStatus as useGatedNominationStatus } from 'data-gate'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useValidators } from 'hooks/useValidators'
import { useTranslation } from 'react-i18next'
import type { MaybeAddress } from 'types'

// Keep presentation and account roles in the app; the gate owns data and readiness.
export const useNominationStatus = (who: MaybeAddress) => {
	const { t } = useTranslation()
	const { isNominator } = useStaking()
	const { isValidator } = useValidators()
	const { getNominations } = useBalances()

	// Get the nomination status from the data gate.
	const result = useGatedNominationStatus(who)

	const { status, loading, error } = result
	let message: string
	if (isValidator(who)) {
		message = t('youAreValidator', { ns: 'app' })
	} else if (loading) {
		message = t('syncing', { ns: 'app' })
	} else if (error) {
		message = '—'
	} else if (!isNominator) {
		message = t('notNominating', { ns: 'pages' })
	} else if (!getNominations(who).length) {
		message = t('noNominationsSet', { ns: 'pages' })
	} else if (status === 'active') {
		message = `${t('nominatingAnd', { ns: 'pages' })} ${t('earningRewards', { ns: 'pages' })}`
	} else {
		message = t('waitingForActiveNominations', { ns: 'pages' })
	}

	return { ...result, message }
}
