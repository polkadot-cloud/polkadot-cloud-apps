// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TimeLeftFormatted } from '@w3ux/types'
import type { ReactNode } from 'react'

/**
 * Enumeration of available stat types
 */
export enum StatType {
	NUMBER = 'number',
	TEXT = 'text',
	PIE = 'pie',
	TIMELEFT = 'timeleft',
	BUTTON = 'button',
}

/**
 * Base properties shared by all stat configurations
 */
export interface StatConfigBase {
	id: string
	label: string
	helpKey?: string
	isPreloading?: boolean
}

/**
 * Configuration for Number stat type
 * Displays a numeric value with optional decimals and unit
 */
export interface NumberStatConfig extends StatConfigBase {
	type: StatType.NUMBER
	value: number
	decimals?: number
	unit?: string
}

/**
 * Configuration for Text stat type
 * Displays a text/string value
 */
export interface TextStatConfig extends StatConfigBase {
	type: StatType.TEXT
	value: string
	primary?: boolean
}

/**
 * Configuration for Pie stat type
 * Displays a pie chart with a value
 */
export interface PieStatConfig extends StatConfigBase {
	type: StatType.PIE
	value: string | number
	unit: string
	total?: string | number
	pieValue: number
	tooltip?: string
}

/**
 * Configuration for Timeleft stat type
 * Displays a countdown with progress graph
 */
export interface TimeleftStatConfig extends StatConfigBase {
	type: StatType.TIMELEFT
	timeleft: TimeLeftFormatted
	graph: {
		value1: number
		value2: number
	}
	tooltip?: string
}

/**
 * Configuration for Button stat type
 * Displays a button card with icon and action
 */
export interface ButtonStatConfig extends StatConfigBase {
	type: StatType.BUTTON
	Icon: ReactNode
	label: string
	title: string
	onClick: () => void
}

/**
 * Union type of all stat configurations
 */
export type StatConfig =
	| NumberStatConfig
	| TextStatConfig
	| PieStatConfig
	| TimeleftStatConfig
	| ButtonStatConfig

/**
 * Props for the Stats component
 */
export interface StatsProps {
	items: StatConfig[]
}
