// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import {
	eraRewardPoints$,
	getEraRewardPoints,
	getValidatorEraPoints,
} from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useTooltip } from 'hooks/useTooltip'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Graph } from 'ui-core/list'
import type { CurrentEraPointsProps } from '../types'
import { normaliseEraPoints } from '../Utils'
import { Inner } from './Inner'

export const CurrentEraPoints = ({
	address,
	displayFor,
}: CurrentEraPointsProps) => {
	const { t } = useTranslation()
	const { isReady, activeEra } = useApi()
	const { validatorsFetched } = useValidators()
	const { setTooltipTextAndOpen } = useTooltip()

	// Get an era high value from era individuals data
	const getEraHigh = (individual: [string, number][]) =>
		individual.reduce((high, [, points]) => (points > high ? points : high), 0)

	// Store era reward points for the current address
	const [eraPoints, setEraPoints] = useState<BigNumber>(
		new BigNumber(getValidatorEraPoints(address) || 0),
	)

	// Store highest performing validator points for era
	const [eraHigh, setEraHigh] = useState<number>(
		getEraHigh(getEraRewardPoints().individual) || 0,
	)

	// Normalise era point data for graph
	const normalisedPoints = normaliseEraPoints(
		{
			[String(activeEra.index)]: eraPoints,
		},
		new BigNumber(eraHigh),
	)
	const normalisedPoint = Object.values(normalisedPoints)[0]
	const syncing = !isReady || !validatorsFetched || eraHigh <= 1
	const tooltipText = t('eraRewardPoints', {
		ns: 'app',
		points: eraPoints.toFormat(),
	})

	useEffect(() => {
		const subEraRewardPoints = eraRewardPoints$.subscribe((result) => {
			const { individual } = result
			const addressEntry = individual.find((item) => item[0] === address)
			const addressEraPoints = new BigNumber(addressEntry?.[1] || 0)
			setEraPoints(addressEraPoints)
			setEraHigh(getEraHigh(individual))
		})

		return () => {
			subEraRewardPoints.unsubscribe()
		}
	}, [])

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
						points={Array(7).fill(normalisedPoint)}
						syncing={syncing}
						displayFor={displayFor}
					/>
				</>
			}
		></Graph>
	)
}
