// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { Head, Preload, Title } from 'ui-core/canvas'
import { CloseCanvas } from 'ui-overlay'
import { planckToUnitBn } from 'utils'

export const Preloader = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { bondedPools } = useBondedPools()
	const {
		poolsConfig: { counterForPoolMembers },
	} = useApi()
	const { unit, units } = getStakingChainData(network)

	let totalPoolPoints = new BigNumber(0)
	bondedPools.forEach((b: BondedPool) => {
		totalPoolPoints = totalPoolPoints.plus(b.points)
	})
	const totalPoolPointsUnit = planckToUnitBn(totalPoolPoints, units)
		.decimalPlaces(0)
		.toFormat()

	return (
		<>
			<Head>
				<CloseCanvas />
			</Head>
			<Title>
				<h1>{t('pool', { ns: 'app' })}</h1>
				<h3>
					{t('joinPoolHeading', {
						ns: 'pages',
						totalMembers: new BigNumber(counterForPoolMembers).toFormat(),
						totalPoolPoints: totalPoolPointsUnit,
						unit,
						network: capitalizeFirstLetter(network),
					})}
				</h3>
			</Title>
			<Preload title={`${t('analyzingPoolPerformance', { ns: 'app' })}...`} />
		</>
	)
}
