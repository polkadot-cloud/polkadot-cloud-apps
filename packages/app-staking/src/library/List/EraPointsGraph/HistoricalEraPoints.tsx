// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useTooltip } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Graph } from 'ui-core/list'
import type { EraPointsHistoricalProps } from '../types'
import { normaliseEraPoints, prefillEraPoints } from '../Utils'
import { Inner } from './Inner'

export const HistoricalEraPoints = ({
	displayFor,
	eraPoints,
}: EraPointsHistoricalProps) => {
	const { t } = useTranslation('app')
	const { isReady } = useApi()
	const { erasPerDay } = useErasPerDay()
	const { validatorsFetched } = useValidators()
	const { setTooltipTextAndOpen } = useTooltip()

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
	const prefilledPoints = prefillEraPoints(Object.values(normalisedPoints))
	const syncing = !isReady || !eraPoints.length || !validatorsFetched
	const tooltipText = t('validatorPerformance', {
		count: Math.ceil(30 / erasPerDay),
	})

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
					<Inner
						points={prefilledPoints}
						syncing={syncing}
						displayFor={displayFor}
					/>
				</>
			}
		></Graph>
	)
}
