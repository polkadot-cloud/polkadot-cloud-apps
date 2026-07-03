// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BarSegmentShowLabelThreshold } from './defaults'
import type { BarSegmentProps } from './types'

export const BarSegment = ({
	dataClass,
	widthPercent,
	flexGrow,
	label,
	forceShow,
}: BarSegmentProps) => (
	<div
		className={dataClass}
		style={{
			width: `${flexGrow || forceShow ? 100 : widthPercent}%`,
			flexGrow,
		}}
	>
		{widthPercent >= BarSegmentShowLabelThreshold ||
		(widthPercent < BarSegmentShowLabelThreshold && forceShow) ? (
			<span>{label}</span>
		) : null}
	</div>
)
