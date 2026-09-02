// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNetwork } from 'hooks/useNetwork'
import { RetainmentStats } from 'library/ValidatorList/RetainmentStats'
import { useRetainmentStatsData } from 'library/ValidatorList/useRetainmentStatsData'
import { useValidatorRetainment } from 'plugin-staking-api'
import type { ValidatorRetainmentPeriod } from 'plugin-staking-api/types'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { Loader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import classes from './index.module.scss'

interface RetainmentPeriodProps {
	period: ValidatorRetainmentPeriod
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

const RetainmentPeriod = ({
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

	return (
		<div className={classes.period}>
			<RetainmentStats
				className={classes.stats}
				data={data}
				showLabel={false}
				unit={unit}
			/>
		</div>
	)
}

const HistoryPreloader = () => (
	<div className={classes.preloader} aria-hidden="true">
		<Loader className={classes.preloaderTitle} />
		<Loader className={classes.preloaderBody} />
	</div>
)

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
		validatorDisplay: string
	}
	const queryEnabled = suppliedPeriods === undefined && validator !== undefined
	const { data, loading } = useValidatorRetainment(
		{ network, validator: validator ?? '' },
		{ skip: !queryEnabled },
	)
	const periods =
		suppliedPeriods ?? data.validatorRetainment?.months.slice(0, 6) ?? []
	const historyPeriods = trimTrailingEmptyPeriods(periods)

	return (
		<>
			<ModalTitle title={t('retainmentHistory')} />
			<div className={classes.content}>
				<h2 className={classes.validator} title={validatorDisplay}>
					{validatorDisplay}
				</h2>
				<div className={classes.history}>
					{loading ? (
						<HistoryPreloader />
					) : (
						<>
							{historyPeriods.map((period, index) => (
								<div key={period.fromTimestamp}>
									<RetainmentPeriod
										period={period}
										selfStakeMax={selfStakeMax}
										unit={unit}
										units={units}
									/>
									{index < historyPeriods.length - 1 && (
										<div className={classes.arrow} aria-hidden="true">
											<FontAwesomeIcon icon={faArrowDown} />
										</div>
									)}
								</div>
							))}
							<div className={classes.historyEnd}>- {t('endOfHistory')} -</div>
						</>
					)}
				</div>
			</div>
		</>
	)
}
