// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classes from './index.module.scss'

type Segment = {
	color: string
	id: string
	value: number
}

export const SegmentedBar = ({
	ariaLabel,
	segments,
}: {
	ariaLabel: string
	segments: Segment[]
}) => {
	const normalizedSegments = segments.map(({ color, id, value }) => ({
		color,
		id,
		value: Math.max(value, 0),
	}))
	const total = normalizedSegments.reduce((sum, { value }) => sum + value, 0)

	return (
		<span className={classes.segmentedBar} role="img" aria-label={ariaLabel}>
			{normalizedSegments.map(({ color, id, value }) => (
				<span
					key={id}
					className={classes.segment}
					style={{
						backgroundColor: color,
						width: total === 0 ? 0 : `${(value / total) * 100}%`,
					}}
				/>
			))}
		</span>
	)
}
