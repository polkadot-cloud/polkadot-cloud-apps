// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { PoolSharesDays } from 'consts'
import { PolkadotKnownPoolIds } from 'consts/pools'
import type { Locale } from 'date-fns'
import { getUnixTime } from 'date-fns'
import type { CombinedPoolReward } from 'plugin-staking-api/types'
import { useMemo } from 'react'
import styled from 'styled-components'
import { GraphWrapper, PoolSharesBar } from 'ui-graphs'
import { startOfUTCDay, subUTCDays } from 'utils'

const PREVIEW_REWARDS = [
	0.049, 0.051, 0.05, 0.052, 0.049, 0.05, 0.051, 0.05, 0.052, 0.05, 0.049,
	0.051, 0.05, 0.052, 0.051, 0.05, 0.049, 0.051, 0.05,
]
const PREVIEW_CLAIM_DAYS = [6, 15, 24]

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
	dateFormat: Locale
	getThemeValue: (key: string) => string
	height: string
	poolId?: number
	unit: string
	units: number
	width: string
	labels: {
		poolShares: string
		claim: string
		claimed: string
	}
}

export const PoolSharesDemoGraph = ({
	activeAddress,
	dateFormat,
	getThemeValue,
	height,
	poolId,
	unit,
	units,
	width,
	labels,
}: PoolSharesDemoGraphProps) => {
	const currentDate = useMemo(() => startOfUTCDay(new Date()), [])
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
				<PoolSharesBar
					days={PoolSharesDays}
					entries={previewEntries}
					claimedEntries={previewClaims}
					syncing={false}
					height={height}
					hideYAxisLabels
					getThemeValue={getThemeValue}
					unit={unit}
					units={units}
					dateFormat={dateFormat}
					labels={labels}
				/>
			</Fade>
		</GraphWrapper>
	)
}
