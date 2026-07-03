// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util/chains'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import { useSupplyStaked } from 'hooks/useSupplyStaked'
import type { AnnouncementItem } from 'library/Announcements/types'
import { CardWrapper } from 'library/Card/Wrappers'
import { Wrapper } from 'library/List'
import { useTranslation } from 'react-i18next'
import { CardHeader } from 'ui-core/base'
import { Announcements } from './Announcements'

export const NetworkStats = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { bondedPools } = useBondedPools()
	const {
		poolsConfig: { counterForPoolMembers },
		activeEra,
	} = useApi()
	const { supplyString } = useSupplyStaked()
	const { counterForNominators, counterForValidators } = useStakingMetrics()
	const { unit } = getStakingChainData(network)

	const items: AnnouncementItem[] = [
		{
			category: t('participation', { ns: 'pages' }),
			label: t('supplyStaked', { ns: 'pages', unit }),
			value: `${supplyString}%`,
			helpKey: 'Supply Staked',
		},
		{
			category: t('participation', { ns: 'pages' }),
			label: t('totalValidators', { ns: 'pages' }),
			value: new BigNumber(counterForValidators).toFormat(0),
			helpKey: 'Validator',
		},
		{
			category: t('participation', { ns: 'pages' }),
			label: t('totalNominators', { ns: 'pages' }),
			value: new BigNumber(counterForNominators).toFormat(0),
			helpKey: 'Total Nominators',
		},
		{
			category: t('participation', { ns: 'pages' }),
			label: t('activeEra', { ns: 'pages' }),
			value: new BigNumber(activeEra.index).toFormat(0),
		},
		{
			category: t('pools', { ns: 'pages' }),
			label: t('activePools', { ns: 'pages' }),
			value: new BigNumber(bondedPools.length).toFormat(),
			helpKey: 'Active Pools',
		},
		{
			category: t('pools', { ns: 'pages' }),
			label: t('poolMembers', { ns: 'modals' }),
			value: `${new BigNumber(counterForPoolMembers).toFormat()}`,
			helpKey: 'Nomination Pools',
		},
	]

	return (
		<CardWrapper>
			<CardHeader margin>
				<h4>{t('networkStats', { ns: 'pages' })}</h4>
			</CardHeader>
			<Wrapper>
				<Announcements items={items} />
			</Wrapper>
		</CardWrapper>
	)
}
