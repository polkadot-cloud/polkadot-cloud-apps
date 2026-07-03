// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCaretUp,
	faToggleOff,
	faToggleOn,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useAverageRewardRate } from 'hooks/useAverageRewardRate'
import { useCurrency } from 'hooks/useCurrency'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useRewardOverviewStats } from 'hooks/useStats'
import { useTokenPrices } from 'hooks/useTokenPrices'
import { AnnouncementsList } from 'library/Announcements/AnnouncementsList'
import { Balance } from 'library/Balance'
import { CardWrapper } from 'library/Card/Wrappers'
import type { NominatorListItemData } from 'library/NominatorList/types'
import { Stats } from 'library/Stats'
import { formatFiatCurrency } from 'locales/util'
import { usePayeeNominatorRewards } from 'plugin-staking-api'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardHeader, Page, RewardGrid, Separator, Stat } from 'ui-core/base'
import type { PayoutHistoryProps } from '../types'
import { IncomingPayouts } from './IncomingPayouts'
import { AccountPayouts } from './PayoutGraph'
import { RewardTrend } from './RewardTrend'

export const Overview = (props: PayoutHistoryProps) => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { currency } = useCurrency()
	const { pluginEnabled } = usePlugins()
	const { avgCommission } = useValidators()
	const { activeAddress } = useActiveAccount()
	const { price: tokenPrice } = useTokenPrices()
	const { getAverageRewardRate } = useAverageRewardRate()
	const { averageRewardRate, rewardCalculator } = useRewardOverviewStats()
	const { stakedBalance } = useAccountBalances(activeAddress)

	const { unit, units } = getStakingChainData(network)
	const Token = getChainIcons(network).token
	const stakingApiEnabled = pluginEnabled('staking_api')

	const { data: incomingProjectionData } = usePayeeNominatorRewards({
		network,
		payee: activeAddress || '',
		days: 30,
		skip: !stakingApiEnabled || !activeAddress,
	})

	// Whether to show base or commission-adjusted rewards
	const [showAdjusted, setShowCommissionAdjusted] = useState<boolean>(true)

	// Whether to include incoming payout account projections in totals
	const [includeIncomingProjection, setIncludeIncomingProjection] =
		useState<boolean>(false)

	const currentStake = stakedBalance.toNumber()
	const annualRewardBase = currentStake * (getAverageRewardRate() / 100) || 0

	const annualRewardAfterCommission =
		annualRewardBase * (1 - avgCommission / 100)

	const incomingPerformance30d = useMemo(() => {
		const rewards = incomingProjectionData.payeeNominatorRewards.rewards
			.slice()
			.sort((a, b) => a.era - b.era)
			.slice(-30)
			.map((item) => new BigNumber(planckToUnit(item.reward, units)).toNumber())

		return Array.from(
			{ length: Math.max(30 - rewards.length, 0) },
			() => 0,
		).concat(rewards)
	}, [incomingProjectionData.payeeNominatorRewards.rewards, units])

	const incomingProjectionAccounts = useMemo<NominatorListItemData[]>(
		() =>
			incomingProjectionData.payeeNominatorRewards.active.map((item) => ({
				address: item.address,
				label: item.label || item.address,
				stakedBalance: new BigNumber(
					planckToUnit(item.stakedBalance, units),
				).toNumber(),
				validatorApy: item.validatorApy,
				incomingPayouts30d: new BigNumber(
					planckToUnit(item.incomingPayouts, units),
				).toNumber(),
				performance30d: incomingPerformance30d,
			})),
		[
			incomingProjectionData.payeeNominatorRewards.active,
			incomingPerformance30d,
			units,
		],
	)

	const totalIncoming30d = new BigNumber(
		planckToUnit(incomingProjectionData.payeeNominatorRewards.total, units),
	).toNumber()

	const incomingAnnualProjection = incomingProjectionAccounts.reduce(
		(acc, item) => acc + item.stakedBalance * (item.validatorApy / 100),
		0,
	)
	const incomingStakedBalance = incomingProjectionAccounts.reduce(
		(acc, item) => acc + item.stakedBalance,
		0,
	)

	const activeAnnualReward = showAdjusted
		? annualRewardAfterCommission
		: annualRewardBase

	const annualReward =
		activeAnnualReward +
		(includeIncomingProjection ? incomingAnnualProjection : 0)
	const monthlyReward = annualReward / 12
	const dailyReward = annualReward / 365
	const totalDisplayedStake =
		currentStake + (includeIncomingProjection ? incomingStakedBalance : 0)

	// Format the currency with user's locale and currency preference
	const formatLocalCurrency = (value: number) =>
		formatFiatCurrency(value, currency)

	const projectedRewardAnnouncements = [
		{
			label: t('stakedBalance'),
			value: '',
			valueNode: (
				<Balance.WithFiat
					Token={<Token />}
					value={totalDisplayedStake}
					currency={currency}
				/>
			),
		},
	]

	const showIncomingPayouts =
		incomingProjectionAccounts.length > 0 && stakingApiEnabled

	return (
		<>
			<Stat.Row>
				<Stats items={[averageRewardRate, rewardCalculator]} />
				{pluginEnabled('staking_api') && <RewardTrend />}
			</Stat.Row>
			<Page.Row>
				<CardWrapper>
					<AccountPayouts {...props} />
				</CardWrapper>
			</Page.Row>
			{stakingApiEnabled && (
				<>
					{showIncomingPayouts && (
						<Page.Row>
							<IncomingPayouts
								accounts={incomingProjectionAccounts}
								unit={unit}
								currency={currency}
								totalIncoming30d={totalIncoming30d}
							/>
						</Page.Row>
					)}
					<Page.Row>
						<CardWrapper>
							<CardHeader>
								<h3>{t('projectedRewards')}</h3>
							</CardHeader>
							<Separator style={{ margin: '0 0 1.5rem 0', border: 0 }} />
							<div style={{ padding: '0.5rem' }}>
								<h3>
									<button
										type="button"
										onClick={() => setShowCommissionAdjusted(!showAdjusted)}
									>
										<FontAwesomeIcon
											icon={showAdjusted ? faToggleOn : faToggleOff}
											style={{
												color: showAdjusted
													? 'var(--gray-1000)'
													: 'var(--text-tertiary)',
												marginRight: '0.8rem',
											}}
											transform={'grow-6'}
										/>
										{t('deductAvgCommissionOf', {
											commission: avgCommission,
										})}
									</button>
								</h3>
							</div>
							{showIncomingPayouts && (
								<div style={{ padding: '0 0.5rem 0.5rem 0.5rem' }}>
									<h3>
										<button
											type="button"
											onClick={() =>
												setIncludeIncomingProjection(!includeIncomingProjection)
											}
										>
											<FontAwesomeIcon
												icon={
													includeIncomingProjection ? faToggleOn : faToggleOff
												}
												style={{
													color: includeIncomingProjection
														? 'var(--gray-1000)'
														: 'var(--text-tertiary)',
													marginRight: '0.8rem',
												}}
												transform={'grow-6'}
											/>
											{t('includeIncomingProjection', {
												defaultValue: 'Include incoming payouts',
											})}
										</button>
									</h3>
								</div>
							)}
							<Separator transparent />
							<AnnouncementsList items={projectedRewardAnnouncements} />
							<Separator transparent />
							<RewardGrid.Root>
								<RewardGrid.Head>
									<RewardGrid.Cells
										items={[
											<h4>{t('period')}</h4>,
											<h4>
												<Token />
												{unit}
											</h4>,
											<h4>{currency}</h4>,
										]}
									/>
								</RewardGrid.Head>
								<RewardGrid.Row>
									<RewardGrid.Cell>
										<RewardGrid.Label>{t('daily')}</RewardGrid.Label>
									</RewardGrid.Cell>
									<RewardGrid.Cell>
										<h3>
											{dailyReward > 0 && <FontAwesomeIcon icon={faCaretUp} />}
											{dailyReward.toLocaleString('en-US', {
												minimumFractionDigits: 3,
												maximumFractionDigits: 3,
											})}
										</h3>
									</RewardGrid.Cell>
									<RewardGrid.Cell>
										<h3>
											{dailyReward > 0 && tokenPrice > 0 && (
												<FontAwesomeIcon icon={faCaretUp} />
											)}
											{formatLocalCurrency(dailyReward * tokenPrice)}
										</h3>
									</RewardGrid.Cell>
								</RewardGrid.Row>
								<RewardGrid.Row>
									<RewardGrid.Cells
										items={[
											<RewardGrid.Label>{t('monthly')}</RewardGrid.Label>,
											<h3>
												{monthlyReward > 0 && (
													<FontAwesomeIcon icon={faCaretUp} />
												)}
												{monthlyReward.toLocaleString('en-US', {
													minimumFractionDigits: 3,
													maximumFractionDigits: 3,
												})}
											</h3>,
											<h3>
												{monthlyReward > 0 && tokenPrice > 0 && (
													<FontAwesomeIcon icon={faCaretUp} />
												)}
												{formatLocalCurrency(monthlyReward * tokenPrice)}
											</h3>,
										]}
									/>
								</RewardGrid.Row>
								<RewardGrid.Row>
									<RewardGrid.Cells
										items={[
											<RewardGrid.Label>{t('annual')}</RewardGrid.Label>,
											<h3>
												{annualReward > 0 && (
													<FontAwesomeIcon icon={faCaretUp} />
												)}
												{annualReward.toLocaleString('en-US', {
													minimumFractionDigits: 3,
													maximumFractionDigits: 3,
												})}
											</h3>,
											<h3>
												{annualReward > 0 && tokenPrice > 0 && (
													<FontAwesomeIcon icon={faCaretUp} />
												)}
												{formatLocalCurrency(annualReward * tokenPrice)}
											</h3>,
										]}
									/>
								</RewardGrid.Row>
							</RewardGrid.Root>
						</CardWrapper>
					</Page.Row>
				</>
			)}
		</>
	)
}
