// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useNominationStatus } from 'data-gate'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { BasicItem } from 'ui-app/ListItem'

export const PoolNominateStatus = ({ pool }: { pool: BondedPool }) => {
	const { t } = useTranslation('app')
	const { poolsNominations } = useBondedPools()
	const { status, loading, error } = useNominationStatus(pool.addresses.stash)

	// Get the list of targets this pool is nominating.
	const targets = poolsNominations[pool.id]?.targets ?? []

	return (
		<BasicItem.PoolStatus status={status ?? null}>
			<h4>
				<span>
					{loading
						? `${t('syncing')}...`
						: error
							? '—'
							: targets.length && status
								? capitalizeFirstLetter(t(status))
								: t('notNominating')}
				</span>
			</h4>
		</BasicItem.PoolStatus>
	)
}
