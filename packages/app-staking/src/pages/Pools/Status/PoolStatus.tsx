// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faExclamationTriangle,
	faLock,
} from '@fortawesome/free-solid-svg-icons'
import { useActivePool } from 'hooks/useActivePool'
import { useNominationStatus } from 'hooks/useNominationStatus'
import { useSyncing } from 'hooks/useSyncing'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'

export const PoolStatus = () => {
	const { t } = useTranslation('pages')
	const { syncing } = useSyncing(['active-pools'])
	const { getNominationStatus } = useNominationStatus()
	const { activePool, activePoolNominations } = useActivePool()

	const poolStash = activePool?.addresses?.stash || ''
	const { earningRewards, nominees } = getNominationStatus(poolStash, 'pool')
	const poolState = activePool?.bondedPool?.state ?? null
	const poolNominating = !!activePoolNominations?.targets?.length

	// Determine pool state icon.
	let poolStateIcon
	switch (poolState) {
		case 'Blocked':
			poolStateIcon = faLock
			break
		case 'Destroying':
			poolStateIcon = faExclamationTriangle
			break
		default:
			poolStateIcon = undefined
	}

	// Determine pool status - left side.
	const poolStatusLeft =
		poolState === 'Blocked'
			? `${t('locked')} / `
			: poolState === 'Destroying'
				? `${t('destroying')} / `
				: ''

	// Determine pool status - right side.
	const poolStatusRight = syncing
		? t('inactivePoolNotNominating')
		: !poolNominating
			? t('inactivePoolNotNominating')
			: nominees.active.length
				? `${t('poolsNominatingAnd')} ${
						earningRewards ? t('earningRewards') : t('notEarningRewards')
					}`
				: t('waitingForActiveNominations')

	return (
		<Stat
			icon={syncing ? undefined : poolStateIcon}
			label={t('poolStatus')}
			helpKey="Nomination Status"
			stat={`${poolStatusLeft}${poolStatusRight}`}
		/>
	)
}
