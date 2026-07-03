// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Button } from 'library/StatCards/Button'
import { Number } from 'library/StatCards/Number'
import { Pie } from 'library/StatCards/Pie'
import { Text } from 'library/StatCards/Text'
import { Timeleft } from 'library/StatCards/Timeleft'
import type { StatConfig, StatsProps } from './types'

/**
 * Renders a single stat based on its configuration type
 */
const StatItem = ({ config }: { config: StatConfig }) => {
	const { type, label, helpKey, isPreloading } = config

	switch (type) {
		case 'number':
			return (
				<Number
					key={label}
					label={label}
					value={config.value}
					decimals={config.decimals}
					unit={config.unit || ''}
					helpKey={helpKey}
					isPreloading={isPreloading}
				/>
			)

		case 'text':
			return (
				<Text
					key={label}
					label={label}
					value={config.value}
					primary={config.primary}
					helpKey={helpKey}
					isPreloading={isPreloading}
				/>
			)

		case 'pie':
			return (
				<Pie
					key={label}
					label={label}
					stat={{
						value: config.value,
						unit: config.unit,
						total: config.total,
					}}
					pieValue={config.pieValue}
					tooltip={config.tooltip}
					helpKey={helpKey}
					isPreloading={isPreloading}
				/>
			)

		case 'timeleft':
			return (
				<Timeleft
					key={label}
					label={label}
					timeleft={config.timeleft}
					graph={config.graph}
					tooltip={config.tooltip}
					helpKey={helpKey}
					isPreloading={isPreloading}
				/>
			)

		case 'button':
			return (
				<Button
					key={label}
					Icon={config.Icon}
					label={config.label}
					title={config.title}
					onClick={config.onClick}
					isPreloading={isPreloading}
				/>
			)

		default:
			return null
	}
}

/**
 * Data-driven Stats component that renders stat cards based on configuration.
 *
 * Usage:
 * ```tsx
 * <Stat.Row>
 *   <Stats items={[
 *     { id: 'count', type: 'number', label: 'Active Pools', value: 100, helpKey: 'Active Pools' },
 *     { id: 'rate', type: 'text', label: 'Reward Rate', value: '5.2%', primary: true },
 *   ]} />
 * </Stat.Row>
 * ```
 */
export const Stats = ({ items }: StatsProps) => (
	<>
		{items.map((config) => (
			<StatItem key={config.id} config={config} />
		))}
	</>
)
