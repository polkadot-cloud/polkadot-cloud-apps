// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowRight,
	faArrowTrendDown,
	faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type BigNumber from 'bignumber.js'
import { useTranslation } from 'react-i18next'
import {
	FlowLabel,
	FlowMetric,
	FlowValue,
	IdentityCount,
	MonthBadge,
	RetainmentBadges,
	RetainmentBody,
	RetainmentHeader,
	RetainmentRow,
	RetainmentTitle,
} from './Wrappers'

interface RetainmentMonth {
	fromTimestamp: number
	netFlow: number
	selfStakeChange: number
	retainmentRate: number
	compoundRate: number
}

interface RetainmentStatsProps {
	selfStake?: BigNumber
	unit: string
}

const MAX_SELF_STAKE_DOT = 100_000

// TODO: Map validatorRetainment into this view model once the query is wired up. The UI currently
// presents only the latest month. Monthly self stake change and net flow stay dummy until the
// API exposes signed fields for them.
const DUMMY_RETAINMENT: {
	identityCount: number
	month: RetainmentMonth
} = {
	identityCount: 10,
	month: {
		fromTimestamp: Date.UTC(2026, 6, 1) / 1000,
		netFlow: 2_240,
		selfStakeChange: 50_500,
		retainmentRate: 88,
		compoundRate: 64,
	},
}

const clampRate = (rate: number) =>
	Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 100) : 0

const getRateColor = (rate: number): string => {
	if (rate >= 75) {
		return 'var(--status-success)'
	}
	if (rate >= 50) {
		return 'var(--status-warning)'
	}
	if (rate >= 25) {
		return 'color-mix(in srgb, var(--status-warning) 55%, var(--status-danger))'
	}
	return 'var(--status-danger)'
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
	rate: number
	max?: boolean
	showTrend?: boolean
	locale?: string
	maximumLabel: string
}) => {
	const value = max ? 100 : clampRate(rate)
	const valueText = max ? 'MAX' : formatRate(value, locale)
	const trendIcon = showTrend
		? value >= 75
			? faArrowTrendUp
			: value < 25
				? faArrowTrendDown
				: undefined
		: undefined

	return (
		<FlowMetric>
			<FlowValue
				$color={getRateColor(value)}
				role="meter"
				aria-label={label}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={value}
				aria-valuetext={max ? maximumLabel : valueText}
			>
				{trendIcon && <FontAwesomeIcon icon={trendIcon} aria-hidden="true" />}
				<span>{valueText}</span>
			</FlowValue>
			<FlowLabel title={label}>{label}</FlowLabel>
		</FlowMetric>
	)
}

export const RetainmentStats = ({ selfStake, unit }: RetainmentStatsProps) => {
	const { t, i18n } = useTranslation('app')

	const { month, identityCount } = DUMMY_RETAINMENT
	const compoundMax =
		unit === 'DOT' && selfStake?.gte(MAX_SELF_STAKE_DOT) === true

	const monthDate = new Date(month.fromTimestamp * 1000)
	const monthLabel = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(monthDate)
	const identitiesLabel = t('retainmentIdentityCount', {
		count: identityCount,
		defaultValue:
			identityCount === 1 ? '{{count}} identity' : '{{count}} identities',
	})

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
	const selfStakeDirection =
		month.selfStakeChange > 0
			? 'increase'
			: month.selfStakeChange < 0
				? 'decrease'
				: 'none'
	const selfStakeColor =
		selfStakeDirection === 'increase'
			? 'var(--status-success)'
			: selfStakeDirection === 'decrease'
				? 'var(--status-danger)'
				: 'var(--text-tertiary)'
	const selfStakeIcon =
		selfStakeDirection === 'increase'
			? faArrowTrendUp
			: selfStakeDirection === 'decrease'
				? faArrowTrendDown
				: faArrowRight
	const selfStakePrefix =
		month.selfStakeChange > 0 ? '+' : month.selfStakeChange < 0 ? '−' : ''
	const selfStakeValue = Math.abs(month.selfStakeChange).toLocaleString(
		i18n.resolvedLanguage,
		{
			notation: 'compact',
			maximumFractionDigits: 1,
		},
	)
	const selfStakeLabel = t('selfStake', { defaultValue: 'Self stake' })

	const retainmentLabel = t('retainmentRate', {
		defaultValue: 'Retainment rate',
	})
	const compoundLabel = t('compoundRate', {
		defaultValue: 'Compound rate',
	})
	const maximumLabel = t('maximum', { defaultValue: 'Maximum' })
	const statsLabel = t('retainmentStats', {
		defaultValue: 'Retainment stats',
	})

	return (
		<RetainmentRow className="row retainment" aria-label={statsLabel}>
			<RetainmentHeader>
				<RetainmentTitle>
					{t('retainment', { defaultValue: 'Retainment' })}
				</RetainmentTitle>
				<RetainmentBadges>
					<IdentityCount title={identitiesLabel}>
						{identitiesLabel}
					</IdentityCount>
					<MonthBadge dateTime={monthDate.toISOString()}>
						{monthLabel}
					</MonthBadge>
				</RetainmentBadges>
			</RetainmentHeader>
			<RetainmentBody>
				<RateStat
					label={retainmentLabel}
					rate={month.retainmentRate}
					showTrend={false}
					locale={i18n.resolvedLanguage}
					maximumLabel={maximumLabel}
				/>
				<RateStat
					label={compoundLabel}
					rate={month.compoundRate}
					max={compoundMax}
					locale={i18n.resolvedLanguage}
					maximumLabel={maximumLabel}
				/>
				<FlowMetric>
					<FlowValue
						$color={selfStakeColor}
						aria-label={`${selfStakeLabel}: ${selfStakePrefix}${selfStakeValue} ${unit}`}
					>
						<FontAwesomeIcon icon={selfStakeIcon} aria-hidden="true" />
						<span>
							{selfStakePrefix}
							{selfStakeValue}
						</span>
						<small>{unit}</small>
					</FlowValue>
					<FlowLabel title={selfStakeLabel}>{selfStakeLabel}</FlowLabel>
				</FlowMetric>
				<FlowMetric>
					<FlowValue
						$color={flowColor}
						aria-label={`${flowLabel}: ${flowValue} ${unit}`}
					>
						<FontAwesomeIcon icon={flowIcon} aria-hidden="true" />
						<span>
							{flowPrefix}
							{flowValue}
						</span>
						<small>{unit}</small>
					</FlowValue>
					<FlowLabel title={flowLabel}>{flowLabel}</FlowLabel>
				</FlowMetric>
			</RetainmentBody>
		</RetainmentRow>
	)
}
