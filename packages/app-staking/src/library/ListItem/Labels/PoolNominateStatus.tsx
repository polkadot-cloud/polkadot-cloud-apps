// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import { useEraStakers } from 'contexts/EraStakers'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { PoolStatusWrapper } from 'library/ListItem/Wrappers'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { getPoolNominationStatusCode } from 'utils'

export const PoolNominateStatus = ({ pool }: { pool: BondedPool }) => {
	const { t } = useTranslation('app')
	const { poolsNominations } = useBondedPools()
	const { eraStakers, getNominationsStatusFromEraStakers } = useEraStakers()

	const { addresses } = pool

	// get pool targets from nominations meta batch
	const nominations = poolsNominations[pool.id]
	const targets = nominations?.targets || []

	// store nomination status in state
	const [nominationsStatus, setNominationsStatus] =
		useState<Record<string, string>>()

	// update pool nomination status as nominations metadata becomes available.
	// we cannot add effect dependencies here as this needs to trigger
	// as soon as the component displays. (upon tab change).
	const handleNominationsStatus = () => {
		setNominationsStatus(
			getNominationsStatusFromEraStakers(addresses.stash, targets),
		)
	}

	// recalculate nominations status as app syncs
	useEffect(() => {
		if (
			targets.length &&
			nominationsStatus === null &&
			eraStakers.stakers.length
		) {
			handleNominationsStatus()
		}
	})

	// metadata has changed, which means pool items may have been added.
	// recalculate nominations status
	useEffect(() => {
		handleNominationsStatus()
	}, [pool, eraStakers.stakers.length, Object.keys(poolsNominations).length])

	// determine nominations status and display
	const nominationStatus = getPoolNominationStatusCode(
		nominationsStatus || null,
	)

	return (
		<PoolStatusWrapper $status={nominationStatus}>
			<h4>
				<span>
					{nominationStatus === null || !eraStakers.stakers.length
						? `${t('syncing')}...`
						: targets.length
							? capitalizeFirstLetter(t(`${nominationStatus}`) ?? '')
							: t('notNominating')}
				</span>
			</h4>
		</PoolStatusWrapper>
	)
}
