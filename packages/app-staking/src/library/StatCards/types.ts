// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TimeLeftFormatted } from '@w3ux/types'
import type { ReactNode } from 'react'

export interface CardCommon {
	isPreloading?: boolean
	helpKey?: string
}

export interface NumberProps extends CardCommon {
	label: string
	value: number
	decimals?: number
	unit: string
}

export interface PieProps extends CardCommon {
	label: string
	stat: {
		value: string | number
		unit: string | number
		total?: string | number
	}
	pieValue: number
	tooltip?: string
}

export interface TextProps extends CardCommon {
	primary?: boolean
	label: string
	value: string
}

export interface TickerProps extends CardCommon {
	primary?: boolean
	label: string
	value: string
	direction?: 'up' | 'down'
	unit: string
	changePercent: string
}

export interface TimeleftProps extends CardCommon {
	label: string
	timeleft: TimeLeftFormatted
	graph: {
		value1: number
		value2: number
	}
	tooltip?: string
}

export interface ButtonProps extends CardCommon {
	Icon: ReactNode
	label: string
	title: string
	onClick: () => void
}
