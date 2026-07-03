// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { getStakingChainData, isPoolShareEnabled } from 'consts/util'
import { useThemeValues } from 'contexts/ThemeValues'
import { getUnixTime } from 'date-fns'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import {
	usePoolEraRewards,
	usePoolRewards,
	useRewards,
} from 'plugin-staking-api'
import type {
	NominatorReward,
	RewardResult,
	RewardResults,
} from 'plugin-staking-api/types'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AveragePayoutLine, PayoutBar } from 'ui-graphs'

interface Props {
	nominating: boolean
	inPool: boolean
	lineMarginTop: string
	setLastReward: (reward: RewardResult | undefined) => void
}
export const ActiveGraph = ({
	nominating,
	inPool,
	lineMarginTop,
	setLastReward,
}: Props) => {
	const { i18n, t } = useTranslation()
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { activePool } = useActivePool()
	const { getThemeValue } = useThemeValues()
	const { activeAddress } = useActiveAccount()
	const { unit, units } = getStakingChainData(network)
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	const { data: nominatorRewardData, loading: rewardsLoading } = useRewards({
		network,
		who: activeAddress || '',
		fromEra: Math.max(activeEra.index - 1, 0),
	})

	const days = 30
	const fromDate = new Date()
	fromDate.setUTCDate(fromDate.getUTCDate() - days)
	fromDate.setUTCHours(0, 0, 0, 0)

	const {
		data: { poolRewards },
		loading: poolRewardsLoading,
	} = usePoolRewards({
		network,
		who: activeAddress || '',
		from: getUnixTime(fromDate),
	})

	// Pool-era reward share metrics are only available for the known
	// pools on the Polkadot network.
	const poolShareEnabled = isPoolShareEnabled(network, activePool?.id)

	const {
		data: { poolEraRewards },
	} = usePoolEraRewards({
		network,
		who: activeAddress || '',
		fromEra: Math.max(activeEra.index - 1, 0),
		skip: !poolShareEnabled || !activeAddress,
	})

	const nominatorRewards = nominatorRewardData.allRewards
	const payouts =
		nominatorRewards.filter((reward: NominatorReward) => reward.claimed) ?? []
	const unclaimedPayouts =
		nominatorRewards.filter((reward: NominatorReward) => !reward.claimed) ?? []

	const poolClaims = poolRewards ?? []
	const allRewards = (nominatorRewards as RewardResults)
		.concat(poolClaims)
		.sort((a, b) => b.timestamp - a.timestamp)

	useEffect(() => {
		setLastReward(allRewards[0])
	}, [allRewards.length, allRewards[0]?.timestamp, allRewards[0]?.reward])

	return (
		<>
			<PayoutBar
				days={days}
				height="150px"
				data={{
					payouts,
					unclaimedPayouts,
					poolClaims,
					poolShareRewards: poolShareEnabled ? poolEraRewards : undefined,
				}}
				nominating={nominating}
				inPool={inPool}
				syncing={rewardsLoading || poolRewardsLoading}
				getThemeValue={getThemeValue}
				unit={unit}
				units={units}
				dateFormat={dateFormat}
				labels={{
					payout: t('payouts', { ns: 'app' }),
					poolClaim: t('poolClaim', { ns: 'app' }),
					unclaimedPayouts: t('unclaimedPayouts', { ns: 'app' }),
					pending: t('pending', { ns: 'app' }),
					poolShare: t('share', { ns: 'app' }),
				}}
				activeAccount={activeAddress || undefined}
			/>
			<div style={{ marginTop: lineMarginTop }}>
				<AveragePayoutLine
					days={days}
					average={10}
					height="65px"
					data={{ payouts, unclaimedPayouts, poolClaims }}
					getThemeValue={getThemeValue}
					unit={unit}
					units={units}
					labels={{
						payout: t('payouts', { ns: 'app' }),
						dayAverage: t('dayAverage', { ns: 'app' }),
					}}
				/>
			</div>
		</>
	)
}
