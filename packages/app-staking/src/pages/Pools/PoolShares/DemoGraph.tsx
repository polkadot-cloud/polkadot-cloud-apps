// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { PoolSharesDays } from 'consts'
import { PolkadotKnownPoolIds } from 'consts/pools'
import type { Locale } from 'date-fns'
import { getUnixTime } from 'date-fns'
import type { CombinedPoolReward } from 'plugin-staking-api/types'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { GraphWrapper, PoolSharesBar, PoolSharesTrendLine } from 'ui-graphs'
import type { PoolSharesPlotAreaPadding } from 'ui-graphs/types'
import { startOfUTCDay, subUTCDays } from 'utils'

const PREVIEW_REWARDS = [
	7.8, 8.2, 8, 8.5, 7.9, 8.1, 8.4, 8.2, 8.7, 8.3, 8, 8.5, 8.2, 8.8, 8.6, 8.3,
	8.1, 8.5, 8.4,
]
const PREVIEW_CLAIM_DAYS = [6, 10, 15, 20, 24]

const Fade = styled.div`
  height: 100%;
  position: relative;

  &::after {
    background: linear-gradient(
      to right,
      color-mix(in srgb, var(--bg-primary) 10%, transparent) 60%,
      var(--bg-primary) 90%
    );
    bottom: -2rem;
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: -3rem;
    z-index: 1;
  }
`

export interface PoolSharesDemoGraphProps {
	activeAddress?: string
	barHeight: string
	dateFormat: Locale
	getThemeValue: (key: string) => string
	height: string
	poolId?: number
	trendHeight: string
	unit: string
	units: number
	width: string
	labels: {
		amount: string
		claim: string
	}
}

export const PoolSharesDemoGraph = ({
	activeAddress,
	barHeight,
	dateFormat,
	getThemeValue,
	height,
	poolId,
	trendHeight,
	unit,
	units,
	width,
	labels,
}: PoolSharesDemoGraphProps) => {
	const currentDate = useMemo(() => startOfUTCDay(new Date()), [])
	const [plotAreaPadding, setPlotAreaPadding] =
		useState<PoolSharesPlotAreaPadding>({ left: 0, right: 0 })
	const handlePlotAreaChange = useCallback(
		(padding: PoolSharesPlotAreaPadding) => {
			setPlotAreaPadding((current) =>
				current.left === padding.left && current.right === padding.right
					? current
					: padding,
			)
		},
		[],
	)
	const previewEntries = useMemo<CombinedPoolReward[]>(
		() =>
			PREVIEW_REWARDS.map((reward, index) => ({
				reward: new BigNumber(reward)
					.shiftedBy(units)
					.integerValue(BigNumber.ROUND_HALF_UP)
					.toString(),
				timestamp: getUnixTime(
					subUTCDays(currentDate, PoolSharesDays - index - 1),
				),
				who: activeAddress || '',
				poolId: poolId ?? PolkadotKnownPoolIds[0],
				source: 'share',
			})),
		[currentDate, units, activeAddress, poolId],
	)
	const previewClaims = useMemo<CombinedPoolReward[]>(
		() =>
			PREVIEW_CLAIM_DAYS.map((index) => ({
				reward: new BigNumber(0.3)
					.shiftedBy(units)
					.integerValue(BigNumber.ROUND_HALF_UP)
					.toString(),
				timestamp: getUnixTime(
					subUTCDays(currentDate, PoolSharesDays - index - 1),
				),
				who: activeAddress || '',
				poolId: poolId ?? PolkadotKnownPoolIds[0],
				source: 'reward',
			})),
		[currentDate, units, activeAddress, poolId],
	)

	return (
		<GraphWrapper
			style={{
				height,
				opacity: 0.35,
				pointerEvents: 'none',
				position: 'absolute',
				width,
			}}
		>
			<Fade>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '0.75rem',
					}}
				>
					<PoolSharesBar
						barColor={getThemeValue('--gray-800')}
						days={PoolSharesDays}
						entries={previewEntries}
						claimedEntries={previewClaims}
						syncing={false}
						height={barHeight}
						getThemeValue={getThemeValue}
						unit={unit}
						units={units}
						dateFormat={dateFormat}
						onPlotAreaChange={handlePlotAreaChange}
						yAxisMax={10}
						labels={labels}
					/>
					<PoolSharesTrendLine
						days={PoolSharesDays}
						entries={previewEntries}
						claimedEntries={previewClaims}
						syncing={false}
						height={trendHeight}
						getThemeValue={getThemeValue}
						unit={unit}
						units={units}
						dateFormat={dateFormat}
						plotAreaPadding={plotAreaPadding}
						labels={labels}
					/>
				</div>
			</Fade>
		</GraphWrapper>
	)
}
