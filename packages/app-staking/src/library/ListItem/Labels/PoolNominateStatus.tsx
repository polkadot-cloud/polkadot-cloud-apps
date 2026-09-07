// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useNominationStatuses } from 'data-gate/react'
import { aggregateNominationStatus } from 'data-gate/resources/nominations'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { BasicItem } from 'ui-app/ListItem'

export const PoolNominateStatus = ({ pool }: { pool: BondedPool }) => {
	const { t } = useTranslation('app')
	const { poolsNominations } = useBondedPools()
	const targets = poolsNominations[pool.id]?.targets ?? []
	const result = useNominationStatuses(pool.addresses.stash, targets)
	const status = result.data ? aggregateNominationStatus(result.data) : null
	return (
		<BasicItem.PoolStatus status={status}>
			<h4>
				<span>
					{result.loading
						? `${t('syncing')}...`
						: result.error
							? '—'
							: targets.length
								? capitalizeFirstLetter(t(status ?? 'waiting'))
								: t('notNominating')}
				</span>
			</h4>
		</BasicItem.PoolStatus>
	)
}
