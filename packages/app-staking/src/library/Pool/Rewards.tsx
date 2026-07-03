// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useTooltip } from 'hooks/useTooltip'
import { normaliseEraPoints, prefillEraPoints } from 'library/List/Utils'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Graph } from 'ui-core/list'
import type { RewardProps, RewardsGraphProps } from './types'

export const Rewards = ({ displayFor = 'default' }: RewardProps) => {
	const { t } = useTranslation('app')
	const { isReady } = useApi()
	const { erasPerDay } = useErasPerDay()
	const { setTooltipTextAndOpen } = useTooltip()

	// NOTE: Component currently not in use. Pool performance data is no longer being fetched.
	const poolRewardPoints = {}
	const eraRewardPoints = {}
	const high = new BigNumber(1)

	const normalisedPoints = normaliseEraPoints(eraRewardPoints, high)
	const prefilledPoints = prefillEraPoints(Object.values(normalisedPoints))

	const empty = Object.values(poolRewardPoints).length === 0
	const syncing = !isReady
	const tooltipText = `${Math.ceil(30 / erasPerDay)} ${t('dayPoolPerformance')}`

	return (
		<Graph
			syncing={syncing}
			canvas={displayFor === 'canvas'}
			Inner={
				<>
					<TooltipArea
						text={tooltipText}
						onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
					/>
					<RewardsGraph points={prefilledPoints} syncing={empty} />
				</>
			}
		></Graph>
	)
}

export const RewardsGraph = ({ points = [], syncing }: RewardsGraphProps) => {
	const totalSegments = points.length - 1
	const vbWidth = 512
	const vbHeight = 115
	const xPadding = 5
	const yPadding = 10
	const xArea = vbWidth - 2 * xPadding
	const yArea = vbHeight - 2 * yPadding
	const xSegment = xArea / totalSegments
	let xCursor = xPadding

	const pointsCoords = points.map((point: number) => {
		const coord = {
			x: xCursor,
			y: vbHeight - yPadding - yArea * point,
			zero: point === 0,
		}
		xCursor += xSegment
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

	const barCoords = []
	for (let i = 0; i <= pointsCoords.length - 1; i++) {
		barCoords.push({
			x1: pointsCoords[i].x,
			y1: vbHeight - yPadding,
			x2: pointsCoords[i].x,
			y2: pointsCoords[i]?.y,
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
			{!syncing && (
				<line
					key="grid_coord_mid"
					strokeWidth="3.75"
					stroke="var(--grid-primary)"
					x1={0}
					y1={vbHeight * 0.5}
					x2={vbWidth}
					y2={vbHeight * 0.5}
					opacity={0.5}
				/>
			)}

			{!syncing &&
				barCoords.map(({ x1, y1, x2, y2 }) => (
					<line
						key={`line_coord_${x1}_${y1}_${x2}_${y2}`}
						strokeWidth={5}
						opacity={1}
						stroke="var(--gray-300)"
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
					/>
				))}

			{!syncing &&
				lineCoords.map(({ x1, y1, x2, y2, zero }) => (
					<line
						key={`line_coord_${x1}_${y1}_${x2}_${y2}`}
						strokeWidth={5}
						opacity={zero ? 0.5 : 1}
						stroke={zero ? 'var(--text-tertiary)' : 'var(--gray-1000)'}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
					/>
				))}
		</svg>
	)
}
