// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useNetwork } from 'hooks/useNetwork'
import { Identity } from 'library/ListItem/Labels/Identity'
import { RetainmentStats } from 'library/ValidatorList/RetainmentStats'
import { useRetainmentStatsData } from 'library/ValidatorList/useRetainmentStatsData'
import { useValidatorRetainment } from 'plugin-staking-api'
import type { ValidatorRetainmentPeriod } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { useOverlay } from 'ui-overlay'
import { getRetainmentStatus } from 'utils'
import classes from './index.module.scss'

interface RetainmentPeriodProps {
	current?: boolean
	isPreloading?: boolean
	period?: ValidatorRetainmentPeriod
	selfStakeMax: boolean
	unit: string
	units: number
}

const hasRetainmentStats = (period: ValidatorRetainmentPeriod) =>
	period.retainmentRate !== null ||
	period.compoundRate !== 0 ||
	Number(period.netInflow) !== 0 ||
	Number(period.selfStakeChange) !== 0

const trimTrailingEmptyPeriods = (periods: ValidatorRetainmentPeriod[]) => {
	const visiblePeriods = periods.slice(0, 6)
	let historyEnd = visiblePeriods.length

	while (
		historyEnd > 0 &&
		!hasRetainmentStats(visiblePeriods[historyEnd - 1])
	) {
		historyEnd -= 1
	}

	return visiblePeriods.slice(0, historyEnd)
}

const getPeriodStatus = (period: ValidatorRetainmentPeriod) =>
	typeof period.retainmentRate === 'number' &&
	Number.isFinite(period.retainmentRate)
		? getRetainmentStatus(period.retainmentRate)
		: undefined

const RetainmentPeriod = ({
	current = false,
	isPreloading = false,
	period,
	selfStakeMax,
	unit,
	units,
}: RetainmentPeriodProps) => {
	const data = useRetainmentStatsData({
		period,
		selfStakeMax,
		unit,
		units,
	})
	const status = period ? getPeriodStatus(period) : undefined

	return (
		<li
			className={classes.timelineItem}
			data-current={current || undefined}
			data-status={status}
		>
			<span className={classes.timelineMarker} aria-hidden="true" />
			<article className={classes.period} aria-current={current || undefined}>
				<RetainmentStats
					className={classes.stats}
					data={data}
					isPreloading={isPreloading}
					showLabel={false}
					unit={unit}
				/>
			</article>
		</li>
	)
}

export const RetainmentHistory = () => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const {
		periods: suppliedPeriods,
		selfStakeMax,
		unit,
		units,
		validator,
		validatorDisplay,
	} = useOverlay().modal.config.options as {
		periods?: ValidatorRetainmentPeriod[]
		selfStakeMax: boolean
		unit: string
		units: number
		validator?: string
		validatorDisplay: ReactNode
	}
	const queryEnabled = suppliedPeriods === undefined && validator !== undefined
	const { data, loading } = useValidatorRetainment(
		{ network, validator: validator ?? '' },
		{ skip: !queryEnabled },
	)
	const periods = suppliedPeriods ?? data.validatorRetainment?.months ?? []
	const historyPeriods = trimTrailingEmptyPeriods(periods)

	return (
		<>
			<ModalTitle title={t('retainmentHistory')} />
			<div className={classes.content}>
				<div className={classes.validator}>
					<Identity
						address={validator ?? ''}
						display={validatorDisplay}
						size="large"
					/>
				</div>
				<ol className={classes.timeline} aria-busy={loading}>
					{loading ? (
						<RetainmentPeriod
							isPreloading
							selfStakeMax={selfStakeMax}
							unit={unit}
							units={units}
						/>
					) : (
						<>
							{historyPeriods.map((period, index) => (
								<RetainmentPeriod
									current={index === 0}
									key={period.fromTimestamp}
									period={period}
									selfStakeMax={selfStakeMax}
									unit={unit}
									units={units}
								/>
							))}
							<li className={classes.timelineEnd}>
								<span className={classes.endMarker} aria-hidden="true" />
								<span className={classes.historyEnd}>{t('endOfHistory')}</span>
							</li>
						</>
					)}
				</ol>
			</div>
		</>
	)
}
