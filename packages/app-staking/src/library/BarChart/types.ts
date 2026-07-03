// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'

export type DataClass = 'd1' | 'd2' | 'd3' | 'd4'

export interface LegendItemProps {
	dataClass?: DataClass
	label: string
	helpKey?: string
	button?: ReactNode
}

export interface BarSegmentProps {
	dataClass: DataClass
	label?: string
	widthPercent: number
	flexGrow: number
	forceShow?: boolean
}
