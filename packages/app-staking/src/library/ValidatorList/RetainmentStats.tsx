// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListItem } from 'ui-app/ListItem'
import { RetainmentStatValue } from './RetainmentStatValue'
import type {
	RetainmentStatData,
	RetainmentStatsData,
} from './useRetainmentStatsData'

interface RetainmentStatsProps {
	className?: string
	data: RetainmentStatsData
	isPreloading?: boolean
	showLabel?: boolean
	unit: string
}

export const RetainmentMetric = ({
	compact = false,
	isPreloading,
	stat,
	unit,
}: {
	compact?: boolean
	isPreloading: boolean
	stat: RetainmentStatData
	unit?: string
}) => {
	const isRate = unit === undefined

	return (
		<ListItem.Metric
			color={stat.color}
			label={stat.label}
			labelProps={{ title: stat.label }}
			valueProps={
				isRate
					? {
							'aria-label': stat.ariaLabel,
							'aria-valuemax': stat.value === undefined ? undefined : 100,
							'aria-valuemin': stat.value === undefined ? undefined : 0,
							'aria-valuenow': stat.value,
							'aria-valuetext': stat.ariaValueText,
							role: stat.value === undefined ? undefined : ('meter' as const),
						}
					: { 'aria-label': stat.ariaLabel }
			}
		>
			{isPreloading ? (
				<ListItem.DetailLoader
					height={compact ? '1.2rem' : undefined}
					width={compact ? '4.5rem' : undefined}
				/>
			) : (
				<RetainmentStatValue stat={stat} unit={unit} />
			)}
		</ListItem.Metric>
	)
}

export const RetainmentStats = ({
	className,
	data,
	isPreloading = false,
	showLabel = true,
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
		<ListItem.Retainment
			aria-busy={isPreloading}
			aria-label={statsLabel}
			className={className}
		>
			<ListItem.SectionHeader>
				{showLabel && <strong>{retainmentLabel}</strong>}
				{isPreloading ? (
					<ListItem.DetailLoader height="0.85rem" width="7rem" />
				) : month ? (
					<ListItem.Month dateTime={month.date.toISOString()}>
						{showLabel && '/ '}
						{month.label}
					</ListItem.Month>
				) : null}
			</ListItem.SectionHeader>
			<ListItem.RetainmentGrid>
				{[retainmentRate, compoundRate].map((stat) => (
					<RetainmentMetric
						key={stat.label}
						isPreloading={isPreloading}
						stat={stat}
					/>
				))}
				{[selfStakeChange, netOutflow].map((stat) => (
					<RetainmentMetric
						key={stat.label}
						isPreloading={isPreloading}
						stat={stat}
						unit={unit}
					/>
				))}
			</ListItem.RetainmentGrid>
		</ListItem.Retainment>
	)
}
