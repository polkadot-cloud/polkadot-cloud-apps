// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
	faArrowRight,
	faArrowTrendDown,
	faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'
import BigNumber from 'bignumber.js'
import type { ValidatorRetainmentPeriod } from 'plugin-staking-api/types'
import { useTranslation } from 'react-i18next'
import { planckToUnitBn } from 'utils'
import { clampRate, getRateColor, MAX_SELF_STAKE_DOT } from './retainment'

export interface RetainmentStatData {
	ariaLabel: string
	ariaValueText?: string
	color: string
	icon?: IconDefinition
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
	netFlow: RetainmentStatData
	retainmentLabel: string
	retainmentRate: RetainmentStatData
	selfStakeChange: RetainmentStatData
	statsLabel: string
}

interface UseRetainmentStatsDataProps {
	period?: ValidatorRetainmentPeriod
	selfStake?: BigNumber
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
		label,
		prefix: '',
		value,
		valueText,
	}
}

const getSignedAmountStat = ({
	label,
	locale,
	unit,
	value,
}: {
	label: string
	locale?: string
	unit: string
	value?: number
}): RetainmentStatData => {
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

	return {
		ariaLabel: `${label}: ${prefix}${valueText}${value === undefined ? '' : ` ${unit}`}`,
		color,
		icon,
		label,
		prefix,
		value,
		valueText,
	}
}

export const useRetainmentStatsData = ({
	period,
	selfStake,
	unit,
	units,
}: UseRetainmentStatsDataProps): RetainmentStatsData => {
	const { t, i18n } = useTranslation('app')
	const locale = i18n.resolvedLanguage
	const compoundMax =
		period !== undefined &&
		unit === 'DOT' &&
		selfStake?.gte(MAX_SELF_STAKE_DOT) === true
	const selfStakeChange = period
		? planckToUnitBn(new BigNumber(period.selfStakeChange), units).toNumber()
		: undefined
	const netInflow = period
		? planckToUnitBn(new BigNumber(period.netInflow), units).toNumber()
		: undefined
	const netFlowLabel =
		netInflow === undefined || netInflow > 0
			? t('netInflow')
			: netInflow < 0
				? t('netOutflow')
				: t('noNetFlow')
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

	return {
		compoundRate: getRateStat({
			label: t('compoundRate'),
			locale,
			maximumLabel,
			max: compoundMax,
			rate: period?.compoundRate,
		}),
		month,
		netFlow: getSignedAmountStat({
			label: netFlowLabel,
			locale,
			unit,
			value: netInflow,
		}),
		retainmentLabel: t('retainment'),
		retainmentRate: getRateStat({
			label: t('retainmentRate'),
			locale,
			maximumLabel,
			rate: period?.retainmentRate,
			showTrend: false,
		}),
		selfStakeChange: getSignedAmountStat({
			label: t('selfStakeChange'),
			locale,
			unit,
			value: selfStakeChange,
		}),
		statsLabel: t('retainmentStats'),
	}
}
