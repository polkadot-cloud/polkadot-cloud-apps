// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTooltip } from 'hooks/useTooltip'
import { TooltipArea } from 'ui-core/base'
import { Graph } from 'ui-core/list'
import type { VerticalPayoutPerformanceProps } from './types'

export const VerticalPayoutPerformance = ({
	amounts,
	tooltipText,
}: VerticalPayoutPerformanceProps) => {
	const { setTooltipTextAndOpen } = useTooltip()
	const safeAmounts = amounts.slice(-30)
	const paddedAmounts = Array.from(
		{ length: Math.max(30 - safeAmounts.length, 0) },
		() => 0,
	).concat(safeAmounts)
	const points = paddedAmounts.map((value, day) => ({
		id: `${day}-${Math.round(value * 1000)}`,
		value,
	}))
	const max = paddedAmounts.reduce((acc, value) => Math.max(acc, value), 0)
	const chartWidth = 240
	const chartHeight = 64
	const xStep = chartWidth / Math.max(points.length, 1)

	return (
		<Graph
			syncing={!amounts.length}
			Inner={
				<>
					{tooltipText && (
						<TooltipArea
							text={tooltipText}
							onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
						/>
					)}
					<svg
						width="100%"
						height="100%"
						viewBox={`0 0 ${chartWidth} ${chartHeight}`}
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						{points.map(({ id, value }, index) => {
							const normalized = max > 0 ? value / max : 0
							const x = index * xStep + xStep * 0.5
							const minHeight = value > 0 ? 6 : 0
							const lineHeight = Math.max(minHeight, normalized * chartHeight)
							return (
								<line
									key={`payout_line_${id}`}
									x1={x}
									y1={chartHeight - lineHeight}
									x2={x}
									y2={chartHeight}
									stroke="var(--gray-1000)"
									strokeWidth={2.5}
									opacity={0.95}
								/>
							)
						})}
					</svg>
				</>
			}
		/>
	)
}
