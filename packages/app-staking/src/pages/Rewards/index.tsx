// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { MaxPayoutDays } from 'consts'
import { isPoolShareEnabled } from 'consts/util'
import { getUnixTime, startOfToday, subDays } from 'date-fns'
import { onTabVisitEvent } from 'event-tracking'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { PageTabs } from 'library/PageTabs'
import {
	fetchPoolEraRewards,
	fetchPoolRewards,
	fetchRewards,
} from 'plugin-staking-api'
import type { NominatorReward, RewardResults } from 'plugin-staking-api/types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { filterAndSortRewards } from 'ui-graphs/util'
import { Overview } from './Overview'
import { NominatorPayouts, PoolPayouts } from './PayoutList'
import type { PayoutGraphData } from './types'
import { Wrapper } from './Wrappers'

export const Rewards = () => {
	const { t } = useTranslation()
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { isBonding } = useStaking()
	const { pluginEnabled } = usePlugins()
	const { activeAddress } = useActiveAccount()
	const { activePool, inPool } = useActivePool()
	const { syncing: tabsSyncing } = useSyncing(['initialization'])
	const apiEnabled = pluginEnabled('staking_api')

	// Store page active tab
	const [activeTab, setActiveTab] = useState<number>(0)

	// Combined payouts list, used by the Overview graph for the date range header. The two payout
	// list tabs each fetch their own paginated data.
	const [payoutsList, setPayoutsList] = useState<RewardResults>([])

	// Store whether data is being fetched
	const [loading, setLoading] = useState<boolean>(false)

	// Store payout graph data.
	const [payoutGraphData, setPayoutGraphData] = useState<PayoutGraphData>({
		payouts: [],
		unclaimedPayouts: [],
		poolClaims: [],
	})

	// Payouts list props to pass to the overview tab
	const pageProps = {
		payoutsList,
		setPayoutsList,
	}

	// Get payout data on account or staking api toggle
	const getPayoutData = async () => {
		const fromDate = subDays(startOfToday(), MaxPayoutDays)

		// Pool-era reward share metrics are restricted to Polkadot Cloud pools on
		// the Polkadot network.
		const poolShareEnabled = isPoolShareEnabled(network, activePool?.id)

		const [{ allRewards }, { poolRewards }, { poolEraRewards }] =
			await Promise.all([
				fetchRewards(
					network,
					activeAddress || '',
					Math.max(activeEra.index - 1, 0),
				),
				fetchPoolRewards(network, activeAddress || '', getUnixTime(fromDate)),
				poolShareEnabled
					? fetchPoolEraRewards(
							network,
							activeAddress || '',
							Math.max(activeEra.index - 1, 0),
						)
					: Promise.resolve({ poolEraRewards: [] }),
			])

		const payouts =
			allRewards.filter((reward: NominatorReward) => reward.claimed) ?? []

		const unclaimedPayouts =
			allRewards.filter((reward: NominatorReward) => !reward.claimed) ?? []

		const poolClaims = poolRewards ?? []

		// Filter zero rewards and order via timestamp, most recent first
		setPayoutsList(
			filterAndSortRewards(
				(allRewards as RewardResults).concat(poolClaims) as RewardResults,
			),
		)
		setPayoutGraphData({
			payouts,
			unclaimedPayouts,
			poolClaims,
			poolShareRewards: poolShareEnabled ? poolEraRewards : undefined,
		})
		setLoading(false)
	}

	// Fetch payout data on account or staking api toggle
	useEffect(() => {
		if (!apiEnabled) {
			setPayoutsList([])
			setPayoutGraphData({
				payouts: [],
				unclaimedPayouts: [],
				poolClaims: [],
			})
		} else if (activeAddress && activeEra.index > 0) {
			setLoading(true)
			getPayoutData()
		}
	}, [network, activeAddress, apiEnabled, activeEra.index, activePool?.id])

	// Reset payout list state on account change
	useEffect(() => {
		setPayoutsList([])
	}, [activeAddress])

	// If the currently active tab becomes hidden (e.g. user leaves a pool while on the Pool Claim
	// tab), fall back to the Overview tab.
	useEffect(() => {
		if (!apiEnabled && activeTab !== 0) {
			setActiveTab(0)
		} else if (activeTab === 1 && !isBonding) {
			setActiveTab(0)
		} else if (activeTab === 2 && !inPool) {
			setActiveTab(0)
		}
	}, [activeTab, apiEnabled, isBonding, inPool])

	const tabs = [
		{
			title: t('overview', { ns: 'app' }),
			active: activeTab === 0,
			onClick: () => {
				onTabVisitEvent('rewards', 'overview')
				setActiveTab(0)
			},
		},
	]
	if (apiEnabled && isBonding) {
		tabs.push({
			title: t('payouts', { ns: 'app' }),
			active: activeTab === 1,
			onClick: () => {
				onTabVisitEvent('rewards', 'nominator_payouts')
				setActiveTab(1)
			},
		})
	}
	if (apiEnabled && inPool) {
		tabs.push({
			title: t('poolClaim', { count: 2, ns: 'app' }),
			active: activeTab === 2,
			onClick: () => {
				onTabVisitEvent('rewards', 'pool_claims')
				setActiveTab(2)
			},
		})
	}

	return (
		<Wrapper>
			<Page.Title title={t('rewards', { ns: 'modals' })}>
				<PageTabs
					tabs={tabs}
					preloading={apiEnabled && tabsSyncing}
					preloaderTabs={1}
				/>
			</Page.Title>
			{activeTab === 0 && (
				<Overview
					{...pageProps}
					payoutGraphData={payoutGraphData}
					loading={loading}
				/>
			)}
			{activeTab === 1 && apiEnabled && isBonding && <NominatorPayouts />}
			{activeTab === 2 && apiEnabled && inPool && <PoolPayouts />}
		</Wrapper>
	)
}
