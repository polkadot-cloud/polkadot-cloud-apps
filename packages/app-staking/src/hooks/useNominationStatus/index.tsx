// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNominationStatuses } from 'data-gate/react'
import { aggregateNominationStatus } from 'data-gate/resources/nominations'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useValidators } from 'hooks/useValidators'
import { useTranslation } from 'react-i18next'
import type { BondFor, MaybeAddress } from 'types'
import { groupNomineesByStatus } from 'utils'

// Presentation compatibility for the active account and active pool. Lists for arbitrary
// nominators consume useNominationStatuses directly with their own account/target scope.
export const useNominationStatus = () => {
	const { t } = useTranslation()
	const { activeAddress } = useActiveAccount()
	const { isNominator } = useStaking()
	const { isValidator } = useValidators()
	const { getNominations } = useBalances()
	const { activePool, activePoolNominations } = useActivePool()
	const nominator = useNominationStatuses(
		activeAddress,
		getNominations(activeAddress),
	)
	const pool = useNominationStatuses(
		activePool?.addresses.stash,
		activePoolNominations?.targets ?? [],
	)
	const getNominationStatus = (who: MaybeAddress, type: BondFor) => {
		const result = type === 'pool' ? pool : nominator
		const matches =
			who === (type === 'pool' ? activePool?.addresses.stash : activeAddress)
		const statuses = matches ? (result.data ?? {}) : {}
		const grouped = groupNomineesByStatus(Object.entries(statuses))
		const status =
			matches && result.data !== undefined && !result.error
				? aggregateNominationStatus(statuses)
				: undefined
		const earningRewards = status === 'active'
		let message: string
		if (type === 'nominator' && isValidator(who))
			message = t('youAreValidator', { ns: 'app' })
		else if (result.loading) message = t('syncing', { ns: 'app' })
		else if (result.error) message = '—'
		else if (type === 'nominator' && !isNominator)
			message = t('notNominating', { ns: 'pages' })
		else if (!Object.keys(statuses).length)
			message = t('noNominationsSet', { ns: 'pages' })
		else if (earningRewards)
			message = `${t('nominatingAnd', { ns: 'pages' })} ${t('earningRewards', { ns: 'pages' })}`
		else message = t('waitingForActiveNominations', { ns: 'pages' })
		return {
			nominees: grouped,
			status,
			earningRewards,
			message,
			syncing: result.loading,
			error: result.error,
		}
	}
	return { getNominationStatus }
}
