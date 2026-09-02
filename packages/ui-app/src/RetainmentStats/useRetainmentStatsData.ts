// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
	faArrowRight,
	faArrowTrendDown,
	faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'react-i18next'
import {
	clampRate,
	formatCompactNumber,
	getRateColor,
	getRetainmentStatus,
	planckToUnitBn,
} from 'utils'

export interface RetainmentPeriodData {
	compoundRate: number
	fromTimestamp: number
	netInflow: string
	retainmentRate: number | null
	selfStakeChange: string
}

export interface RetainmentStatData {
	ariaLabel: string
	ariaValueText?: string
	color: string
	icon?: IconDefinition
	isMax: boolean
	label: string
	prefix: string
	value?: number
	valueText: string
}

export interface RetainmentStatsData {
	compoundRate: RetainmentStatData
	month?: {
		date: Date
		label: string
	}
	netOutflow: RetainmentStatData
	retainmentLabel: string
	retainmentRate: RetainmentStatData
	selfStakeChange: RetainmentStatData
	statusAccent?: 'warning' | 'danger'
	statsLabel: string
}

interface UseRetainmentStatsDataProps {
	highlightWarnings?: boolean
	period?: RetainmentPeriodData
	selfStakeMax: boolean
	unit: string
	units: number
}

const formatRate = (rate: number, locale?: string) =>
	`${rate.toLocaleString(locale, { maximumFractionDigits: 1 })}%`

const getRateStat = ({
	label,
	locale,
	maximumLabel,
	max = false,
	rate,
	showTrend = true,
}: {
	label: string
	locale?: string
	maximumLabel: string
	max?: boolean
	rate?: number | null
	showTrend?: boolean
}): RetainmentStatData => {
	const hasRate = typeof rate === 'number' && Number.isFinite(rate)
	const value = max ? 100 : hasRate ? clampRate(rate) : undefined
	const valueText = max
		? 'MAX'
		: value === undefined
			? '—'
			: formatRate(value, locale)
	const icon =
		showTrend && value !== undefined
			? value >= 75
				? faArrowTrendUp
				: value < 25
					? faArrowTrendDown
					: undefined
			: undefined

	return {
		ariaLabel: label,
		ariaValueText: max ? maximumLabel : valueText,
		color: value === undefined ? 'var(--text-tertiary)' : getRateColor(value),
		icon,
		isMax: max,
		label,
		prefix: '',
		value,
		valueText,
	}
}

const getSignedAmountStat = ({
	label,
	locale,
	maximumLabel,
	max = false,
	unit,
	value,
}: {
	label: string
	locale?: string
	maximumLabel: string
	max?: boolean
	unit: string
	value?: number
}): RetainmentStatData => {
	const valueText = max
		? 'MAX'
		: value === undefined
			? '—'
			: formatCompactNumber(Math.abs(value), locale)
	const color = max
		? 'var(--status-success)'
		: value === undefined || value === 0
			? 'var(--text-tertiary)'
			: value > 0
				? 'var(--status-success)'
				: 'var(--status-danger)'
	const icon = max
		? faArrowTrendUp
		: value === undefined
			? undefined
			: value > 0
				? faArrowTrendUp
				: value < 0
					? faArrowTrendDown
					: faArrowRight
	const prefix =
		max || value === undefined || value === 0 ? '' : value > 0 ? '+' : '−'

	return {
		ariaLabel: max
			? `${label}: ${maximumLabel}`
			: `${label}: ${prefix}${valueText}${value === undefined ? '' : ` ${unit}`}`,
		color,
		icon,
		isMax: max,
		label,
		prefix,
		value,
		valueText,
	}
}

export const useRetainmentStatsData = ({
	highlightWarnings = false,
	period,
	selfStakeMax,
	unit,
	units,
}: UseRetainmentStatsDataProps): RetainmentStatsData => {
	const { t, i18n } = useTranslation('app')
	const locale = i18n.resolvedLanguage
	const displaySelfStakeMax = period !== undefined && selfStakeMax
	const selfStakeChange = period
		? planckToUnitBn(new BigNumber(period.selfStakeChange), units).toNumber()
		: undefined
	const netInflow = period
		? planckToUnitBn(new BigNumber(period.netInflow), units).toNumber()
		: undefined
	const netOutflow =
		netInflow === undefined ? undefined : Math.min(netInflow, 0)
	const monthDate = period ? new Date(period.fromTimestamp * 1000) : undefined
	const month = monthDate
		? {
				date: monthDate,
				label: new Intl.DateTimeFormat(locale, {
					month: 'long',
					year: 'numeric',
					timeZone: 'UTC',
				}).format(monthDate),
			}
		: undefined
	const maximumLabel = t('maximum')
	const retainmentRate = getRateStat({
		label: t('retainmentRate'),
		locale,
		maximumLabel,
		rate: period?.retainmentRate,
		showTrend: false,
	})
	const retainmentStatus =
		highlightWarnings && retainmentRate.value !== undefined
			? getRetainmentStatus(retainmentRate.value)
			: undefined
	const statusAccent =
		retainmentStatus === 'warning' || retainmentStatus === 'danger'
			? retainmentStatus
			: undefined

	return {
		compoundRate: getRateStat({
			label: t('compoundRate'),
			locale,
			maximumLabel,
			max: displaySelfStakeMax,
			rate: period?.compoundRate,
		}),
		month,
		netOutflow: getSignedAmountStat({
			label: t('netOutflow'),
			locale,
			maximumLabel,
			unit,
			value: netOutflow,
		}),
		retainmentLabel: t('retainment'),
		retainmentRate,
		selfStakeChange: getSignedAmountStat({
			label: t('selfStakeChange'),
			locale,
			maximumLabel,
			max: displaySelfStakeMax,
			unit,
			value: selfStakeChange,
		}),
		statusAccent,
		statsLabel: t('retainmentStats'),
	}
}
