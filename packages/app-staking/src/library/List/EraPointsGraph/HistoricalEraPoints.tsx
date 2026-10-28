// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useApi } from 'hooks/useApi'
import { useMemo } from 'react'
import { Graph } from 'ui-core/list'
import type { EraPointsHistoricalProps } from '../types'
import { normaliseEraPoints, prefillEraPoints } from '../Utils'
import { Inner } from './Inner'

export const HistoricalEraPoints = ({
	displayFor,
	eraPoints,
	stretch = false,
	syncing: syncingOverride,
}: EraPointsHistoricalProps) => {
	const { isReady } = useApi()

	const prefilledPoints = useMemo(() => {
		const high = eraPoints.reduce<bigint>((max, { points }) => {
			const value = BigInt(points)
			return value > max ? value : max
		}, 0n)

		const normalisedPoints = normaliseEraPoints(
			Object.fromEntries(
				eraPoints.map(({ era, points }) => [era, new BigNumber(points)]),
			),
			new BigNumber(high || 1),
		)
		return prefillEraPoints(Object.values(normalisedPoints))
	}, [eraPoints])
	const syncing = syncingOverride ?? (!isReady || !eraPoints.length)

	return (
		<Graph
			syncing={syncing}
			canvas={displayFor === 'canvas'}
			Inner={
				<Inner
					points={prefilledPoints}
					syncing={syncing}
					displayFor={displayFor}
					stretch={stretch}
				/>
			}
		/>
	)
}
