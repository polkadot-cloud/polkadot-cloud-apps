// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faExclamationTriangle,
	faLock,
} from '@fortawesome/free-solid-svg-icons'
import { useNominationStatus } from 'data-gate'
import { useActivePool } from 'hooks/useActivePool'
import { useSyncing } from 'hooks/useSyncing'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'

export const PoolStatus = () => {
	const { t } = useTranslation('pages')
	const { syncing } = useSyncing(['active-pools'])
	const { activePool, activePoolNominations } = useActivePool()

	const poolStash = activePool?.addresses?.stash || ''
	const poolState = activePool?.bondedPool?.state ?? null
	const poolNominating = !!activePoolNominations?.targets?.length

	// Synced pools without nomination targets do not need a status request.
	const { status, loading, error } = useNominationStatus(
		!syncing && !poolNominating ? null : poolStash,
		{ dependencies: [activePoolNominations] },
	)

	// Determine pool state icon.
	let poolStateIcon
	if (poolState === 'Blocked') {
		poolStateIcon = faLock
	} else if (poolState === 'Destroying') {
		poolStateIcon = faExclamationTriangle
	}

	// Determine pool status - left side.
	let poolStatusLeft = ''
	if (poolState === 'Blocked') {
		poolStatusLeft = `${t('locked')} / `
	} else if (poolState === 'Destroying') {
		poolStatusLeft = `${t('destroying')} / `
	}

	// Determine pool status - right side.
	let poolStatusRight: string
	if (syncing) {
		poolStatusRight = t('syncing')
	} else if (!poolNominating) {
		poolStatusRight = t('inactivePoolNotNominating')
	} else if (loading) {
		poolStatusRight = t('syncing')
	} else if (error) {
		poolStatusRight = '—'
	} else if (status === 'active') {
		poolStatusRight = `${t('poolsNominatingAnd')} ${t('earningRewards')}`
	} else {
		poolStatusRight = t('waitingForActiveNominations')
	}

	return (
		<Stat
			icon={syncing ? undefined : poolStateIcon}
			label={t('poolStatus')}
			helpKey="Nomination Status"
			stat={`${poolStatusLeft}${poolStatusRight}`}
		/>
	)
}
