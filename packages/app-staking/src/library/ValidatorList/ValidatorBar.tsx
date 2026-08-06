// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import { useList } from 'contexts/List'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import type { ValidatorEraPoints } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { RetainmentStatValue } from './RetainmentStatValue'
import type {
	RetainmentStatData,
	RetainmentStatsData,
} from './useRetainmentStatsData'
import { useValidatorSummaryData } from './ValidatorSummary'
import {
	BarIdentity,
	BarLayout,
	BarPerformanceGraph,
	BarStat,
	BarStatLabel,
	BarStats,
	BarStatValue,
	BarWrapper,
	BlockedBadge,
	HeaderIdentity,
	SummaryStatusDot,
} from './Wrappers'

interface ValidatorBarProps {
	actions: ReactNode
	displayFor: DisplayFor
	eraPoints: ValidatorEraPoints[]
	innerClasses: string
	rate?: number
	retainmentStats: RetainmentStatsData
	selfStake?: BigNumber
	unit: string
	validator: ValidatorListEntry
}

const BarRateStat = ({ stat }: { stat: RetainmentStatData }) => (
	<BarStat>
		<BarStatLabel title={stat.label}>{stat.label}</BarStatLabel>
		<BarStatValue
			$color={stat.color}
			role={stat.value === undefined ? undefined : 'meter'}
			aria-label={stat.ariaLabel}
			aria-valuemin={stat.value === undefined ? undefined : 0}
			aria-valuemax={stat.value === undefined ? undefined : 100}
			aria-valuenow={stat.value}
			aria-valuetext={stat.ariaValueText}
		>
			<RetainmentStatValue stat={stat} />
		</BarStatValue>
	</BarStat>
)

const BarSignedAmountStat = ({
	stat,
	unit,
}: {
	stat: RetainmentStatData
	unit: string
}) => (
	<BarStat>
		<BarStatLabel title={stat.label}>{stat.label}</BarStatLabel>
		<BarStatValue $color={stat.color} aria-label={stat.ariaLabel}>
			<RetainmentStatValue stat={stat} unit={unit} />
		</BarStatValue>
	</BarStat>
)

export const ValidatorBar = ({
	actions,
	displayFor,
	eraPoints,
	innerClasses,
	rate,
	retainmentStats,
	selfStake,
	unit,
	validator,
}: ValidatorBarProps) => {
	const { t } = useTranslation('app')
	const { selectable } = useList()
	const { address, prefs, validatorStatus: status } = validator
	const {
		quartileLabel,
		rateLabel,
		selfStakeLabel,
		statusLabel,
		totalStake,
		validatorStatus,
	} = useValidatorSummaryData({ address, rate, selfStake, status, unit })
	const { compoundRate, netFlow, retainmentRate, selfStakeChange } =
		retainmentStats

	return (
		<BarWrapper>
			<div className={innerClasses}>
				<BarLayout>
					<BarIdentity>
						{selectable && <Select item={validator} />}
						<HeaderIdentity>
							<Identity address={address} />
							{prefs?.blocked === true && (
								<BlockedBadge>{t('blocked')}</BlockedBadge>
							)}
						</HeaderIdentity>
						<BarPerformanceGraph
							aria-label={t('performance')}
							title={t('performance')}
						>
							<HistoricalEraPoints
								address={address}
								displayFor={displayFor}
								eraPoints={eraPoints}
								stretch
							/>
						</BarPerformanceGraph>
					</BarIdentity>

					<BarStats>
						<BarStat>
							<BarStatLabel>
								<SummaryStatusDot
									$active={validatorStatus === 'active'}
									aria-hidden="true"
								/>
								<span>{statusLabel}</span>
							</BarStatLabel>
							<BarStatValue
								title={totalStake ? `${totalStake} ${unit}` : undefined}
							>
								<span>{totalStake ?? '—'}</span>
								{totalStake && <small>{unit}</small>}
							</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>APY</BarStatLabel>
							<BarStatValue>{rateLabel}</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>{t('performance')}</BarStatLabel>
							<BarStatValue>{quartileLabel}</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>
								{t('selfStake', { defaultValue: 'Self stake' })}
							</BarStatLabel>
							<BarStatValue>
								<span>{selfStakeLabel}</span>
								{selfStake !== undefined && <small>{unit}</small>}
							</BarStatValue>
						</BarStat>
						<BarRateStat stat={retainmentRate} />
						<BarRateStat stat={compoundRate} />
						<BarSignedAmountStat stat={selfStakeChange} unit={unit} />
						<BarSignedAmountStat stat={netFlow} unit={unit} />
					</BarStats>

					{actions}
				</BarLayout>
			</div>
		</BarWrapper>
	)
}
