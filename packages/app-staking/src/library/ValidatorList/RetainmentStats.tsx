// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowRight,
	faArrowTrendDown,
	faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import type { ValidatorRetainmentPeriod } from 'plugin-staking-api/types'
import { useTranslation } from 'react-i18next'
import { planckToUnitBn } from 'utils'
import { clampRate, getRateColor, MAX_SELF_STAKE_DOT } from './retainment'
import {
	FlowLabel,
	FlowMetric,
	FlowValue,
	MonthBadge,
	RetainmentBody,
	RetainmentRow,
	SectionHeader,
} from './Wrappers'

interface RetainmentStatsProps {
	period?: ValidatorRetainmentPeriod
	selfStake?: BigNumber
	unit: string
	units: number
}

const formatRate = (rate: number, locale?: string) =>
	`${rate.toLocaleString(locale, { maximumFractionDigits: 1 })}%`

const RateStat = ({
	label,
	rate,
	max = false,
	showTrend = true,
	locale,
	maximumLabel,
}: {
	label: string
	rate?: number | null
	max?: boolean
	showTrend?: boolean
	locale?: string
	maximumLabel: string
}) => {
	const hasRate = typeof rate === 'number' && Number.isFinite(rate)
	const value = max ? 100 : hasRate ? clampRate(rate) : undefined
	const valueText = max
		? 'MAX'
		: value === undefined
			? '—'
			: formatRate(value, locale)
	const trendIcon =
		showTrend && value !== undefined
			? value >= 75
				? faArrowTrendUp
				: value < 25
					? faArrowTrendDown
					: undefined
			: undefined

	return (
		<FlowMetric>
			<FlowLabel title={label}>{label}</FlowLabel>
			<FlowValue
				$color={
					value === undefined ? 'var(--text-tertiary)' : getRateColor(value)
				}
				role={value === undefined ? undefined : 'meter'}
				aria-label={label}
				aria-valuemin={value === undefined ? undefined : 0}
				aria-valuemax={value === undefined ? undefined : 100}
				aria-valuenow={value}
				aria-valuetext={max ? maximumLabel : valueText}
			>
				{trendIcon && <FontAwesomeIcon icon={trendIcon} aria-hidden="true" />}
				<span>{valueText}</span>
			</FlowValue>
		</FlowMetric>
	)
}

const SignedAmountStat = ({
	value,
	label,
	locale,
	unit,
}: {
	value?: number
	label: string
	locale?: string
	unit: string
}) => {
	const valueText =
		value === undefined
			? '—'
			: Math.abs(value).toLocaleString(locale, {
					notation: 'compact',
					maximumFractionDigits: 1,
				})
	const color =
		value === undefined || value === 0
			? 'var(--text-tertiary)'
			: value > 0
				? 'var(--status-success)'
				: 'var(--status-danger)'
	const icon =
		value === undefined
			? undefined
			: value > 0
				? faArrowTrendUp
				: value < 0
					? faArrowTrendDown
					: faArrowRight
	const prefix = value === undefined || value === 0 ? '' : value > 0 ? '+' : '−'

	return (
		<FlowMetric>
			<FlowLabel title={label}>{label}</FlowLabel>
			<FlowValue
				$color={color}
				aria-label={`${label}: ${prefix}${valueText}${value === undefined ? '' : ` ${unit}`}`}
			>
				{icon && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
				<span>
					{prefix}
					{valueText}
				</span>
				{value !== undefined && <small>{unit}</small>}
			</FlowValue>
		</FlowMetric>
	)
}

export const RetainmentStats = ({
	period,
	selfStake,
	unit,
	units,
}: RetainmentStatsProps) => {
	const { t, i18n } = useTranslation('app')
	const compoundMax =
		period !== undefined &&
		unit === 'DOT' &&
		selfStake?.gte(MAX_SELF_STAKE_DOT) === true

	const monthDate = period ? new Date(period.fromTimestamp * 1000) : undefined
	const monthLabel = monthDate
		? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
				month: 'long',
				year: 'numeric',
				timeZone: 'UTC',
			}).format(monthDate)
		: undefined

	const retainmentLabel = t('retainmentRate')
	const compoundLabel = t('compoundRate')
	const selfStakeLabel = t('selfStake')
	const selfStakeChange = period
		? planckToUnitBn(new BigNumber(period.selfStakeChange), units).toNumber()
		: undefined
	const netInflow = period
		? planckToUnitBn(new BigNumber(period.netInflow), units).toNumber()
		: undefined
	const flowLabel =
		netInflow === undefined || netInflow > 0
			? t('netInflow')
			: netInflow < 0
				? t('netOutflow')
				: t('noNetFlow')
	const maximumLabel = t('maximum')
	const statsLabel = t('retainmentStats')

	return (
		<RetainmentRow className="row retainment" aria-label={statsLabel}>
			<SectionHeader>
				<strong>{t('retainment')}</strong>
				{monthDate && monthLabel && (
					<MonthBadge dateTime={monthDate.toISOString()}>
						/ {monthLabel}
					</MonthBadge>
				)}
			</SectionHeader>
			<RetainmentBody>
				<RateStat
					label={retainmentLabel}
					rate={period?.retainmentRate}
					showTrend={false}
					locale={i18n.resolvedLanguage}
					maximumLabel={maximumLabel}
				/>
				<RateStat
					label={compoundLabel}
					rate={period?.compoundRate}
					max={compoundMax}
					locale={i18n.resolvedLanguage}
					maximumLabel={maximumLabel}
				/>
				<SignedAmountStat
					value={selfStakeChange}
					label={selfStakeLabel}
					locale={i18n.resolvedLanguage}
					unit={unit}
				/>
				<SignedAmountStat
					value={netInflow}
					label={flowLabel}
					locale={i18n.resolvedLanguage}
					unit={unit}
				/>
			</RetainmentBody>
		</RetainmentRow>
	)
}
