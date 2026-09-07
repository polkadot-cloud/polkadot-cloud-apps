// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { MaxPayoutDays } from 'consts'
import { isPoolShareEnabled } from 'consts/util'
import {
	useDataCapabilities,
	usePoolEraRewards,
	usePoolRewards,
	useRewards,
} from 'data-gate/react'
import { getUnixTime, startOfToday, subDays } from 'date-fns'
import { onTabVisitEvent } from 'event-tracking'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { DataError } from 'library/DataError'
import { NominationRetainmentWarning } from 'library/NominationRetainmentWarning'
import type { RewardResults } from 'plugin-staking-api/types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageTabs } from 'ui-app/PageTabs'
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
	const { stakingApi: stakingApiEnabled } = useDataCapabilities()
	const { activeAddress } = useActiveAccount()
	const { activePool, inPool } = useActivePool()
	const { syncing: tabsSyncing } = useSyncing(['initialization'])
	const apiEnabled = stakingApiEnabled

	// Store page active tab
	const [activeTab, setActiveTab] = useState<number>(0)

	// Combined payouts list, used by the Overview graph for the date range header. The two payout
	// list tabs each fetch their own paginated data.
	const [payoutsList, setPayoutsList] = useState<RewardResults>([])

	const poolShareEnabled = isPoolShareEnabled(network, activePool?.id)
	const who = activeEra.index > 0 ? activeAddress || '' : ''
	const fromEra = Math.max(activeEra.index - 1, 0)
	const rewards = useRewards({ who, fromEra })
	const claims = usePoolRewards({
		who,
		from: getUnixTime(subDays(startOfToday(), MaxPayoutDays)),
	})
	const shares = usePoolEraRewards({ who, fromEra, skip: !poolShareEnabled })
	const loading = rewards.loading || claims.loading || shares.loading
	const error = rewards.error || claims.error || shares.error
	const payoutGraphData: PayoutGraphData = {
		payouts: rewards.data.allRewards.filter((reward) => reward.claimed),
		unclaimedPayouts: rewards.data.allRewards.filter(
			(reward) => !reward.claimed,
		),
		poolClaims: claims.data.poolRewards,
		poolShareRewards: poolShareEnabled ? shares.data.poolEraRewards : undefined,
	}
	useEffect(() => {
		setPayoutsList(
			filterAndSortRewards([
				...rewards.data.allRewards,
				...claims.data.poolRewards,
			] as RewardResults),
		)
	}, [rewards.data, claims.data])
	const pageProps = { payoutsList, setPayoutsList }

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
			<NominationRetainmentWarning />
			{error && (
				<DataError
					retry={() => {
						void rewards.refresh()
						void claims.refresh()
						void shares.refresh()
					}}
				/>
			)}
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
