// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useStakeStats } from 'hooks/useStats'
import { useSyncing } from 'hooks/useSyncing'
import { PageWarnings } from 'library/PageWarnings'
import { Stats } from 'library/Stats'
import { Active } from 'pages/Nominate/Active'
import { PoolOverview } from 'pages/Pools/Overview'
import { useTranslation } from 'react-i18next'
import { Page, Stat } from 'ui-core/base'

export const Stake = () => {
	const { t } = useTranslation('pages')
	const { activeAddress } = useActiveAccount()
	const { nominatorBalance } = useAccountBalances(activeAddress)
	const { syncing, accountSynced } = useSyncing([
		'initialization',
		'era-stakers',
	])

	let isPreloading = true
	if (activeAddress) {
		isPreloading = syncing || !accountSynced(activeAddress)
	} else {
		isPreloading = syncing
	}

	const { averageRewardRate, minimumToJoinPool, nextReward } =
		useStakeStats(isPreloading)
	const nominating = nominatorBalance.isGreaterThan(0)

	return (
		<>
			<Page.Title title={t('stake')} />
			<PageWarnings />
			{!nominating && (
				<Stat.Row>
					<Stats items={[averageRewardRate, minimumToJoinPool, nextReward]} />
				</Stat.Row>
			)}
			{nominating ? (
				<Active />
			) : (
				<PoolOverview isPreloading={isPreloading} showOtherOptions={true} />
			)}
		</>
	)
}
