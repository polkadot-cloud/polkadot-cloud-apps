// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListItem } from 'ui-app/ListItem'
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
		<ListItem.DetailLoader />
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
		<ListItem.Metric
			color={stat.color}
			label={stat.label}
			labelProps={{ title: stat.label }}
			valueProps={{
				'aria-label': stat.ariaLabel,
				'aria-valuemax': stat.value === undefined ? undefined : 100,
				'aria-valuemin': stat.value === undefined ? undefined : 0,
				'aria-valuenow': stat.value,
				'aria-valuetext': stat.ariaValueText,
				role: stat.value === undefined ? undefined : 'meter',
			}}
		>
			<RetainmentValue isPreloading={isPreloading} stat={stat} />
		</ListItem.Metric>
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
		<ListItem.Metric
			color={stat.color}
			label={stat.label}
			labelProps={{ title: stat.label }}
			valueProps={{ 'aria-label': stat.ariaLabel }}
		>
			<RetainmentValue isPreloading={isPreloading} stat={stat} unit={unit} />
		</ListItem.Metric>
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
		<ListItem.Retainment aria-busy={isPreloading} aria-label={statsLabel}>
			<ListItem.SectionHeader>
				<strong>{retainmentLabel}</strong>
				{isPreloading ? (
					<ListItem.DetailLoader height="0.85rem" width="7rem" />
				) : month ? (
					<ListItem.Month dateTime={month.date.toISOString()}>
						/ {month.label}
					</ListItem.Month>
				) : null}
			</ListItem.SectionHeader>
			<ListItem.RetainmentGrid>
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
			</ListItem.RetainmentGrid>
		</ListItem.Retainment>
	)
}
