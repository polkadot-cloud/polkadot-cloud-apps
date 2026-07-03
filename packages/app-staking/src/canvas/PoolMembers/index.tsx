// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Members } from 'canvas/PoolMembers/Members'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { usePoolMembers } from 'hooks/usePoolMembers'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Head, Main, Title } from 'ui-core/canvas'
import { CloseCanvas, useOverlay } from 'ui-overlay'

export const PoolMembers = () => {
	const { t } = useTranslation()
	const { getBondedPool } = useBondedPools()
	const { resetPoolMemberData } = usePoolMembers()
	const {
		config: { options },
	} = useOverlay().canvas
	const poolId: number = options?.poolId || 0

	const bondedPool = getBondedPool(poolId)

	useEffect(() => {
		return () => resetPoolMemberData()
	}, [resetPoolMemberData])

	return (
		<Main>
			<Head>
				<CloseCanvas />
			</Head>
			<Title>
				<h1>
					{t('pool', { ns: 'modals' })} {poolId}:{' '}
					{t('members', { ns: 'pages' })}
				</h1>
			</Title>
			{bondedPool && <Members bondedPool={bondedPool} />}
		</Main>
	)
}
