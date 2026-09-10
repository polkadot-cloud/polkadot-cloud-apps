// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import { useEraStakers } from 'contexts/EraStakers'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useTranslation } from 'react-i18next'
import type { BondedPool, NominationStatus } from 'types'
import { BasicItem } from 'ui-app/ListItem'
import { getPoolNominationStatusCode } from 'utils'

export const PoolNominateStatus = ({ pool }: { pool: BondedPool }) => {
	const { t } = useTranslation('app')
	const { poolsNominations } = useBondedPools()

	// A loaded pool without nominations has its own entry with an undefined value.
	const nominationsLoaded = Object.hasOwn(poolsNominations, pool.id)
	const targets = poolsNominations[pool.id]?.targets ?? []
	const { exposuresStatus, getNominationsStatusFromEraStakers } = useEraStakers(
		nominationsLoaded && targets.length > 0,
	)

	// All nominating rows share the era exposure query instead of fetching per stash.
	let status: NominationStatus | null = null
	let label: string
	if (
		!nominationsLoaded ||
		(targets.length > 0 && exposuresStatus === 'pending')
	) {
		label = `${t('syncing')}...`
	} else if (!targets.length) {
		label = t('notNominating')
	} else if (exposuresStatus === 'error') {
		label = '—'
	} else {
		status = getPoolNominationStatusCode(
			getNominationsStatusFromEraStakers(pool.addresses.stash, targets),
		)
		label = capitalizeFirstLetter(t(status))
	}

	return (
		<BasicItem.PoolStatus status={status}>
			<h4>
				<span>{label}</span>
			</h4>
		</BasicItem.PoolStatus>
	)
}
