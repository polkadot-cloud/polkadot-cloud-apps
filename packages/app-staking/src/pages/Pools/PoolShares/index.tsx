// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { Odometer } from '@w3ux/react-odometer'
import { minDecimalPlaces } from '@w3ux/utils'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { PoolSharesDays } from 'consts'
import { getStakingChainData, isPoolShareEnabled } from 'consts/util'
import { useThemeValues } from 'contexts/ThemeValues'
import { getUnixTime } from 'date-fns'
import { useActivePool } from 'hooks/useActivePool'
import { useCurrency } from 'hooks/useCurrency'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useSyncing } from 'hooks/useSyncing'
import { Balance } from 'library/Balance'
import { CardWrapper } from 'library/Card/Wrappers'
import { StatusLabel } from 'library/StatusLabel'
import { fetchCombinedPoolRewards, isPoolShareReward } from 'plugin-staking-api'
import type { CombinedPoolReward } from 'plugin-staking-api/types'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardHeader, CardLabel, Page } from 'ui-core/base'
import { GraphWrapper, PoolSharesBar } from 'ui-graphs'
import { planckToUnitBn, startOfUTCDay, subUTCDays } from 'utils'
import { PoolSharesDemoGraph } from './DemoGraph'

const POOL_SHARE_FETCH_LIMIT = 100
const MAX_POOL_SHARE_FETCH_PAGES = 5

export const PoolShares = () => {
	const { i18n, t } = useTranslation('pages')
	const { network } = useNetwork()
	const { currency } = useCurrency()
	const { pluginEnabled } = usePlugins()
	const { activePool } = useActivePool()
	const { getThemeValue } = useThemeValues()
	const { activeAddress } = useActiveAccount()
	const { syncing: syncingInitialization } = useSyncing(['initialization'])
	const { unit, units } = getStakingChainData(network)
	const [loading, setLoading] = useState<boolean>(false)
	const [poolShareRewards, setPoolShareRewards] = useState<
		CombinedPoolReward[]
	>([])
	const [poolClaimRewards, setPoolClaimRewards] = useState<
		CombinedPoolReward[]
	>([])

	const stakingApiEnabled = pluginEnabled('staking_api')
	const poolShareEnabled = isPoolShareEnabled(network, activePool?.id)
	const Token = getChainIcons(network).token
	const graphActive =
		!syncingInitialization &&
		stakingApiEnabled &&
		poolShareEnabled &&
		!!activeAddress
	const currentDate = useMemo(() => startOfUTCDay(new Date()), [])
	const fromTimestamp = useMemo(
		() => getUnixTime(subUTCDays(currentDate, PoolSharesDays - 1)),
		[currentDate],
	)
	const poolShareUnavailable =
		stakingApiEnabled && !poolShareEnabled && !syncingInitialization

	const averageDailyShare = useMemo(() => {
		if (!graphActive) {
			return new BigNumber(0)
		}

		const totalReward = poolShareRewards
			.filter(({ timestamp }) => timestamp >= fromTimestamp)
			.reduce((total, { reward }) => total.plus(reward), new BigNumber(0))

		const averageRewardPlanck = totalReward
			.dividedBy(PoolSharesDays)
			.integerValue(BigNumber.ROUND_HALF_UP)

		return planckToUnitBn(averageRewardPlanck, units)
	}, [fromTimestamp, graphActive, poolShareRewards, units])

	useEffect(() => {
		if (!graphActive) {
			setPoolShareRewards([])
			setPoolClaimRewards([])
			setLoading(false)
			return
		}

		let cancelled = false
		const fetchPoolShares = async () => {
			setLoading(true)
			setPoolShareRewards([])
			setPoolClaimRewards([])
			const shareRewards: CombinedPoolReward[] = []
			const claimRewards: CombinedPoolReward[] = []
			let after: string | undefined

			for (let page = 0; page < MAX_POOL_SHARE_FETCH_PAGES; page++) {
				const {
					combinedPoolRewards: { entries, hasNextPage, nextCursor },
				} = await fetchCombinedPoolRewards(
					network,
					activeAddress || '',
					POOL_SHARE_FETCH_LIMIT,
					after,
				)

				shareRewards.push(...entries.filter(isPoolShareReward))
				claimRewards.push(
					...entries.filter((entry) => !isPoolShareReward(entry)),
				)

				if (
					!hasNextPage ||
					!nextCursor ||
					entries.some(({ timestamp }) => timestamp < fromTimestamp)
				) {
					break
				}
				after = nextCursor
			}

			if (!cancelled) {
				setPoolShareRewards(shareRewards)
				setPoolClaimRewards(claimRewards)
				setLoading(false)
			}
		}

		fetchPoolShares()

		return () => {
			cancelled = true
		}
	}, [graphActive, network, activeAddress, fromTimestamp])

	const dateFormat = useDateFormat(i18n.resolvedLanguage)
	const graphHeight = '175px'
	const graphLabels = {
		poolShares: t('share', { ns: 'app' }),
		claim: t('claim', { ns: 'modals' }),
		claimed: t('claimed'),
	}

	return (
		<Page.Row>
			<CardWrapper>
				<CardHeader margin>
					<h3>{t('rewardTrend')}</h3>
				</CardHeader>
				{!poolShareUnavailable && (
					<CardHeader margin>
						<h4>{t('averageDailyShare')}</h4>
						<h2>
							<Token />
							<Odometer
								value={minDecimalPlaces(averageDailyShare.toFormat(), 2)}
								zeroDecimals={2}
							/>
							<CardLabel>
								<Balance.Value
									tokenBalance={averageDailyShare.toString()}
									currency={currency}
								/>
							</CardLabel>
						</h2>
					</CardHeader>
				)}
				<div className="inner" style={{ minHeight: '205px' }}>
					{!stakingApiEnabled && (
						<StatusLabel
							backgroundOpacity={0.95}
							status="active_service"
							statusFor="staking_api"
							title={t('stakingApiDisabled', { ns: 'pages' })}
							topOffset="38%"
						/>
					)}
					{poolShareUnavailable ? (
						<>
							<StatusLabel
								backgroundOpacity={0.95}
								status="pool_share_unavailable"
								title={t('availableForPolkadotCloudPoolsOnly')}
								topOffset="38%"
							/>
							<PoolSharesDemoGraph
								activeAddress={activeAddress || undefined}
								dateFormat={dateFormat}
								getThemeValue={getThemeValue}
								height={graphHeight}
								poolId={activePool?.id}
								unit={unit}
								units={units}
								width="100%"
								labels={graphLabels}
							/>
						</>
					) : (
						<GraphWrapper
							style={{
								height: graphHeight,
								position: 'absolute',
								opacity: graphActive ? 1 : 0.55,
								transition: 'opacity 0.5s',
							}}
						>
							<PoolSharesBar
								days={PoolSharesDays}
								entries={graphActive ? poolShareRewards : []}
								claimedEntries={graphActive ? poolClaimRewards : []}
								syncing={syncingInitialization || (graphActive && loading)}
								height={graphHeight}
								getThemeValue={getThemeValue}
								unit={unit}
								units={units}
								dateFormat={dateFormat}
								labels={graphLabels}
							/>
						</GraphWrapper>
					)}
				</div>
			</CardWrapper>
		</Page.Row>
	)
}
