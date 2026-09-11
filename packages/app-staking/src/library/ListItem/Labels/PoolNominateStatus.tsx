// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import { useEraStakers } from 'contexts/EraStakers'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useNominationStatus } from 'data-gate'
import { usePlugins } from 'hooks/usePlugins'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { BasicItem } from 'ui-app/ListItem'
import { getPoolNominationStatusCode } from 'utils'

export const PoolNominateStatus = ({ pool }: { pool: BondedPool }) => {
	const { t } = useTranslation('app')
	const { poolsNominations } = useBondedPools()
	const { pluginEnabled } = usePlugins()
	const api = pluginEnabled('staking_api')

	// A loaded pool without nominations has its own entry with an undefined value.
	const nominations = poolsNominations[pool.id]
	const nominationsLoaded = Object.hasOwn(poolsNominations, pool.id)
	const notNominating = nominationsLoaded && !nominations?.targets.length
	const nominationStatus = useNominationStatus(
		api && !notNominating ? pool.addresses.stash : null,
		{ dependencies: [nominations] },
	)
	const { exposuresStatus, getNominationsStatusFromEraStakers } = useEraStakers(
		!api && !!nominations?.targets.length,
	)

	// API rows use the pool stash's aggregate status; node rows share one exposure snapshot.
	const loading = api
		? nominationStatus.loading
		: !nominationsLoaded || exposuresStatus === 'pending'
	const error = api
		? nominationStatus.error
		: nominationsLoaded && exposuresStatus === 'error'
	const status =
		notNominating || loading || error
			? null
			: api
				? (nominationStatus.status ?? null)
				: getPoolNominationStatusCode(
						getNominationsStatusFromEraStakers(
							pool.addresses.stash,
							nominations?.targets ?? [],
						),
					)
	const label = notNominating
		? t('notNominating')
		: error
			? '—'
			: status
				? capitalizeFirstLetter(t(status))
				: `${t('syncing')}...`

	return (
		<BasicItem.PoolStatus status={status}>
			<h4>
				<span>{label}</span>
			</h4>
		</BasicItem.PoolStatus>
	)
}
