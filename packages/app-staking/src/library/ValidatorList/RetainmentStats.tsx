// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { RetainmentStatValue } from './RetainmentStatValue'
import type {
	RetainmentStatData,
	RetainmentStatsData,
} from './useRetainmentStatsData'
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
	data: RetainmentStatsData
	unit: string
}

const RateStat = ({ stat }: { stat: RetainmentStatData }) => {
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
				<RetainmentStatValue stat={stat} />
			</FlowValue>
		</FlowMetric>
	)
}

const SignedAmountStat = ({
	stat,
	unit,
}: {
	stat: RetainmentStatData
	unit: string
}) => {
	return (
		<FlowMetric>
			<FlowLabel title={stat.label}>{stat.label}</FlowLabel>
			<FlowValue $color={stat.color} aria-label={stat.ariaLabel}>
				<RetainmentStatValue stat={stat} unit={unit} />
			</FlowValue>
		</FlowMetric>
	)
}

export const RetainmentStats = ({ data, unit }: RetainmentStatsProps) => {
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
		<RetainmentRow className="row retainment" aria-label={statsLabel}>
			<SectionHeader>
				<strong>{retainmentLabel}</strong>
				{month && (
					<MonthBadge dateTime={month.date.toISOString()}>
						/ {month.label}
					</MonthBadge>
				)}
			</SectionHeader>
			<RetainmentBody>
				<RateStat stat={retainmentRate} />
				<RateStat stat={compoundRate} />
				<SignedAmountStat stat={selfStakeChange} unit={unit} />
				<SignedAmountStat stat={netOutflow} unit={unit} />
			</RetainmentBody>
		</RetainmentRow>
	)
}
