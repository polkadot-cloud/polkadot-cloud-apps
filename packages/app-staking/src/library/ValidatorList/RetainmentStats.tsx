// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	DetailLoader,
	FlowLabel,
	FlowMetric,
	FlowValue,
	MonthBadge,
	RetainmentBody,
	RetainmentRow,
	SectionHeader,
} from 'ui-app/ListItem'
import { RetainmentStatValue } from './RetainmentStatValue'
import type {
	RetainmentStatData,
	RetainmentStatsData,
} from './useRetainmentStatsData'

interface RetainmentStatsProps {
	data: RetainmentStatsData
	isPreloading?: boolean
	unit: string
}

const RetainmentValue = ({
	isPreloading,
	stat,
	unit,
}: {
	isPreloading: boolean
	stat: RetainmentStatData
	unit?: string
}) =>
	isPreloading ? (
		<DetailLoader />
	) : (
		<RetainmentStatValue stat={stat} unit={unit} />
	)

const RateStat = ({
	isPreloading,
	stat,
}: {
	isPreloading: boolean
	stat: RetainmentStatData
}) => {
	return (
		<FlowMetric>
			<FlowLabel title={stat.label}>{stat.label}</FlowLabel>
			<FlowValue
				$color={stat.color}
				role={stat.value === undefined ? undefined : 'meter'}
				aria-label={stat.ariaLabel}
				aria-valuemin={stat.value === undefined ? undefined : 0}
				aria-valuemax={stat.value === undefined ? undefined : 100}
				aria-valuenow={stat.value}
				aria-valuetext={stat.ariaValueText}
			>
				<RetainmentValue isPreloading={isPreloading} stat={stat} />
			</FlowValue>
		</FlowMetric>
	)
}

const SignedAmountStat = ({
	isPreloading,
	stat,
	unit,
}: {
	isPreloading: boolean
	stat: RetainmentStatData
	unit: string
}) => {
	return (
		<FlowMetric>
			<FlowLabel title={stat.label}>{stat.label}</FlowLabel>
			<FlowValue $color={stat.color} aria-label={stat.ariaLabel}>
				<RetainmentValue isPreloading={isPreloading} stat={stat} unit={unit} />
			</FlowValue>
		</FlowMetric>
	)
}

export const RetainmentStats = ({
	data,
	isPreloading = false,
	unit,
}: RetainmentStatsProps) => {
	const {
		compoundRate,
		month,
		netOutflow,
		retainmentLabel,
		retainmentRate,
		selfStakeChange,
		statsLabel,
	} = data

	return (
		<RetainmentRow
			className="row retainment"
			aria-busy={isPreloading}
			aria-label={statsLabel}
		>
			<SectionHeader>
				<strong>{retainmentLabel}</strong>
				{isPreloading ? (
					<DetailLoader height="0.85rem" width="7rem" />
				) : month ? (
					<MonthBadge dateTime={month.date.toISOString()}>
						/ {month.label}
					</MonthBadge>
				) : null}
			</SectionHeader>
			<RetainmentBody>
				<RateStat isPreloading={isPreloading} stat={retainmentRate} />
				<RateStat isPreloading={isPreloading} stat={compoundRate} />
				<SignedAmountStat
					isPreloading={isPreloading}
					stat={selfStakeChange}
					unit={unit}
				/>
				<SignedAmountStat
					isPreloading={isPreloading}
					stat={netOutflow}
					unit={unit}
				/>
			</RetainmentBody>
		</RetainmentRow>
	)
}
