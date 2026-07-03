// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Fragment } from 'react/jsx-runtime'
import type { EraPointsGraphInnerProps } from '../types'

export const Inner = ({
	points: rawPoints = [],
	syncing,
	displayFor,
}: EraPointsGraphInnerProps) => {
	// Prefill with duplicate of start point.
	let points = [rawPoints[0] || 0]
	points = points.concat(rawPoints)
	// Prefill with duplicate of end point.
	points.push(rawPoints[rawPoints.length - 1] || 0)

	const totalSegments = points.length - 2
	const vbWidth = 520
	const vbHeight = 115
	const xPadding = 0
	const yPadding = 10
	const xArea = vbWidth - 2 * xPadding
	const yArea = vbHeight - 2 * yPadding
	const xSegment = xArea / totalSegments
	let xCursor = xPadding

	const pointsCoords = points.map((point: number, index: number) => {
		const coord = {
			x: xCursor,
			y: vbHeight - yPadding - yArea * point,
			zero: point === 0,
		}

		if (index === 0 || index === points.length - 2) {
			xCursor += xSegment * 0.5
		} else {
			xCursor += xSegment
		}
		return coord
	})

	const lineCoords = []
	for (let i = 0; i <= pointsCoords.length - 1; i++) {
		const startZero = pointsCoords[i].zero
		const endZero = pointsCoords[i + 1]?.zero

		lineCoords.push({
			x1: pointsCoords[i].x,
			y1: pointsCoords[i].y,
			x2: pointsCoords[i + 1]?.x || pointsCoords[i].x,
			y2: pointsCoords[i + 1]?.y || pointsCoords[i].y,
			zero: startZero && endZero,
		})
	}

	return (
		<svg
			width="100%"
			height="100%"
			viewBox={`0 0 ${vbWidth} ${vbHeight}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			{lineCoords.map(({ x1, y1, x2, y2 }, index) => {
				if (index === 0 || index === lineCoords.length - 1) {
					return <Fragment key={`grid_y_coord_${x1}`} />
				}
				return (
					<line
						key={`grid_coord_${x1}_${y1}_${x2}_${y2}`}
						strokeWidth={4}
						stroke={
							displayFor === 'canvas'
								? 'var(--grid-secondary)'
								: 'var(--grid-primary)'
						}
						x1={x1}
						y1={0}
						x2={x1}
						y2={vbHeight}
					/>
				)
			})}

			{!syncing && (
				<line
					key="grid_coord_mid"
					strokeWidth={4}
					stroke={
						displayFor === 'canvas'
							? 'var(--grid-secondary)'
							: 'var(--grid-primary)'
					}
					x1={0}
					y1={vbHeight * 0.5}
					x2={vbWidth}
					y2={vbHeight * 0.5}
					opacity={0.5}
				/>
			)}

			{!syncing &&
				lineCoords.map(({ x1, y1, x2, y2, zero }, index) => {
					const startOrEnd = index === 0 || index === lineCoords.length - 2
					const opacity = startOrEnd ? 0.25 : zero ? 0.5 : 1
					return (
						<line
							key={`line_coord_${x1}_${y1}_${x2}_${y2}`}
							strokeWidth={5.5}
							opacity={opacity}
							stroke={zero ? 'var(--text-tertiary)' : 'var(--gray-1000)'}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
						/>
					)
				})}
		</svg>
	)
}
