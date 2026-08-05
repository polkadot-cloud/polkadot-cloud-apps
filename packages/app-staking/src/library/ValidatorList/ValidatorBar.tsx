// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowRight,
	faArrowTrendDown,
	faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type BigNumber from 'bignumber.js'
import { useList } from 'contexts/List'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import { CurrentEraPoints } from 'library/List/EraPointsGraph/CurrentEraPoints'
import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import type { ValidatorEraPoints } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import {
	clampRate,
	DUMMY_RETAINMENT,
	getRateColor,
	MAX_SELF_STAKE_DOT,
} from './retainment'
import { useValidatorSummaryData } from './ValidatorSummary'
import {
	BarIdentity,
	BarLayout,
	BarPerformanceGraph,
	BarStat,
	BarStatLabel,
	BarStats,
	BarStatValue,
	BarWrapper,
	BlockedBadge,
	HeaderIdentity,
	SummaryStatusDot,
} from './Wrappers'

interface ValidatorBarProps {
	actions: ReactNode
	displayFor: DisplayFor
	eraPoints: ValidatorEraPoints[]
	innerClasses: string
	rate?: number
	selfStake?: BigNumber
	stakingApiEnabled: boolean
	unit: string
	validator: ValidatorListEntry
}

export const ValidatorBar = ({
	actions,
	displayFor,
	eraPoints,
	innerClasses,
	rate,
	selfStake,
	stakingApiEnabled,
	unit,
	validator,
}: ValidatorBarProps) => {
	const { t, i18n } = useTranslation('app')
	const { selectable } = useList()
	const { address, prefs, validatorStatus: status } = validator
	const {
		quartileLabel,
		rateLabel,
		selfStakeLabel,
		statusLabel,
		totalStake,
		validatorStatus,
	} = useValidatorSummaryData({ address, rate, selfStake, status, unit })
	const { month } = DUMMY_RETAINMENT
	const compoundMax =
		unit === 'DOT' && selfStake?.gte(MAX_SELF_STAKE_DOT) === true
	const retainmentRate = clampRate(month.retainmentRate)
	const compoundRate = compoundMax ? 100 : clampRate(month.compoundRate)
	const retainmentValue = `${retainmentRate.toLocaleString(
		i18n.resolvedLanguage,
		{ maximumFractionDigits: 1 },
	)}%`
	const compoundValue = compoundMax
		? 'MAX'
		: `${compoundRate.toLocaleString(i18n.resolvedLanguage, {
				maximumFractionDigits: 1,
			})}%`
	const flowDirection =
		month.netFlow > 0 ? 'inflow' : month.netFlow < 0 ? 'outflow' : 'none'
	const flowLabel =
		flowDirection === 'inflow'
			? t('netInflow', { defaultValue: 'Net inflow' })
			: flowDirection === 'outflow'
				? t('netOutflow', { defaultValue: 'Net outflow' })
				: t('noNetFlow', { defaultValue: 'No net flow' })
	const flowColor =
		flowDirection === 'inflow'
			? 'var(--status-success)'
			: flowDirection === 'outflow'
				? 'var(--status-danger)'
				: 'var(--text-tertiary)'
	const flowIcon =
		flowDirection === 'inflow'
			? faArrowTrendUp
			: flowDirection === 'outflow'
				? faArrowTrendDown
				: faArrowRight
	const flowPrefix = month.netFlow > 0 ? '+' : month.netFlow < 0 ? '−' : ''
	const flowValue = Math.abs(month.netFlow).toLocaleString(
		i18n.resolvedLanguage,
		{
			notation: 'compact',
			maximumFractionDigits: 1,
		},
	)

	return (
		<BarWrapper>
			<div className={innerClasses}>
				<BarLayout>
					<BarIdentity>
						{selectable && <Select item={validator} />}
						<HeaderIdentity>
							<Identity address={address} />
							{prefs?.blocked === true && (
								<BlockedBadge>{t('blocked')}</BlockedBadge>
							)}
						</HeaderIdentity>
						<BarPerformanceGraph
							aria-label={t('performance')}
							title={t('performance')}
						>
							{stakingApiEnabled ? (
								<HistoricalEraPoints
									address={address}
									displayFor={displayFor}
									eraPoints={eraPoints}
									stretch
								/>
							) : (
								<CurrentEraPoints
									address={address}
									displayFor={displayFor}
									stretch
								/>
							)}
						</BarPerformanceGraph>
					</BarIdentity>

					<BarStats $withRetainment={stakingApiEnabled}>
						<BarStat>
							<BarStatLabel>
								<SummaryStatusDot
									$active={validatorStatus === 'active'}
									aria-hidden="true"
								/>
								<span>{statusLabel}</span>
							</BarStatLabel>
							<BarStatValue
								title={totalStake ? `${totalStake} ${unit}` : undefined}
							>
								<span>{totalStake ?? '—'}</span>
								{totalStake && <small>{unit}</small>}
							</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>APY</BarStatLabel>
							<BarStatValue>{rateLabel}</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>{t('performance')}</BarStatLabel>
							<BarStatValue>{quartileLabel}</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>
								{t('selfStake', { defaultValue: 'Self stake' })}
							</BarStatLabel>
							<BarStatValue>
								<span>{selfStakeLabel}</span>
								{selfStake !== undefined && <small>{unit}</small>}
							</BarStatValue>
						</BarStat>
						{stakingApiEnabled && (
							<>
								<BarStat>
									<BarStatLabel>
										{t('retainmentRate', {
											defaultValue: 'Retainment',
										})}
									</BarStatLabel>
									<BarStatValue
										$color={getRateColor(retainmentRate)}
										role="meter"
										aria-valuemin={0}
										aria-valuemax={100}
										aria-valuenow={retainmentRate}
									>
										{retainmentValue}
									</BarStatValue>
								</BarStat>
								<BarStat>
									<BarStatLabel>
										{t('compoundRate', { defaultValue: 'Compound' })}
									</BarStatLabel>
									<BarStatValue
										$color={getRateColor(compoundRate)}
										role="meter"
										aria-valuemin={0}
										aria-valuemax={100}
										aria-valuenow={compoundRate}
										aria-valuetext={compoundMax ? 'Maximum' : compoundValue}
									>
										{compoundValue}
									</BarStatValue>
								</BarStat>
								<BarStat>
									<BarStatLabel>{flowLabel}</BarStatLabel>
									<BarStatValue $color={flowColor}>
										<FontAwesomeIcon icon={flowIcon} aria-hidden="true" />
										<span>
											{flowPrefix}
											{flowValue}
										</span>
										<small>{unit}</small>
									</BarStatValue>
								</BarStat>
							</>
						)}
					</BarStats>

					{actions}
				</BarLayout>
			</div>
		</BarWrapper>
	)
}
