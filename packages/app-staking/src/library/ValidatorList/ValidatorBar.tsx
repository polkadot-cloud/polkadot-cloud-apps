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
	DetailLoader,
	HeaderIdentity,
	SummaryStatusDot,
} from 'ui-app/ListItem'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { RetainmentStatValue } from './RetainmentStatValue'
import type {
	RetainmentStatData,
	RetainmentStatsData,
} from './useRetainmentStatsData'
import { useValidatorSummaryData } from './ValidatorSummary'

interface ValidatorBarProps {
	actions: ReactNode
	displayFor: DisplayFor
	eraPoints: ValidatorEraPoints[]
	innerClasses: string
	isPreloading?: boolean
	isStatusValuePreloading?: boolean
	rate?: number
	retainmentStats: RetainmentStatsData
	selfStake?: BigNumber
	selfStakeMax: boolean
	statusActive?: boolean
	statusLabel?: string
	statusValue?: BigNumber
	unit: string
	validator: ValidatorListEntry
}

const BarRateStat = ({
	isPreloading,
	stat,
}: {
	isPreloading: boolean
	stat: RetainmentStatData
}) => (
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
			{isPreloading ? (
				<DetailLoader height="1.2rem" width="4.5rem" />
			) : (
				<RetainmentStatValue stat={stat} />
			)}
		</BarStatValue>
	</BarStat>
)

const BarSignedAmountStat = ({
	isPreloading,
	stat,
	unit,
}: {
	isPreloading: boolean
	stat: RetainmentStatData
	unit: string
}) => (
	<BarStat>
		<BarStatLabel title={stat.label}>{stat.label}</BarStatLabel>
		<BarStatValue $color={stat.color} aria-label={stat.ariaLabel}>
			{isPreloading ? (
				<DetailLoader height="1.2rem" width="4.5rem" />
			) : (
				<RetainmentStatValue stat={stat} unit={unit} />
			)}
		</BarStatValue>
	</BarStat>
)

export const ValidatorBar = ({
	actions,
	displayFor,
	eraPoints,
	innerClasses,
	isPreloading = false,
	isStatusValuePreloading = false,
	rate,
	retainmentStats,
	selfStake,
	selfStakeMax,
	statusActive,
	statusLabel,
	statusValue,
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
		statusLabel: summaryStatusLabel,
		totalStake,
		validatorStatus,
	} = useValidatorSummaryData({
		address,
		rate,
		selfStake,
		selfStakeMax,
		status,
		statusLabel,
		statusValue,
		unit,
	})
	const { compoundRate, netOutflow, retainmentRate, selfStakeChange } =
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
							{isPreloading ? (
								<DetailLoader
									borderRadius="0.3rem"
									height="100%"
									width="100%"
								/>
							) : (
								<HistoricalEraPoints
									address={address}
									displayFor={displayFor}
									eraPoints={eraPoints}
									stretch
								/>
							)}
						</BarPerformanceGraph>
					</BarIdentity>

					<BarStats>
						<BarStat>
							<BarStatLabel>
								<SummaryStatusDot
									$active={statusActive ?? validatorStatus === 'active'}
									aria-hidden="true"
								/>
								<span>{summaryStatusLabel}</span>
							</BarStatLabel>
							<BarStatValue
								title={totalStake ? `${totalStake} ${unit}` : undefined}
							>
								{isStatusValuePreloading ? (
									<DetailLoader height="1.2rem" width="4.5rem" />
								) : (
									<>
										<span>{totalStake ?? '—'}</span>
										{totalStake && <small>{unit}</small>}
									</>
								)}
							</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>APY</BarStatLabel>
							<BarStatValue>
								{isPreloading ? (
									<DetailLoader height="1.2rem" width="4.5rem" />
								) : (
									rateLabel
								)}
							</BarStatValue>
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
								{selfStake !== undefined && !selfStakeMax && (
									<small>{unit}</small>
								)}
							</BarStatValue>
						</BarStat>
						<BarRateStat isPreloading={isPreloading} stat={retainmentRate} />
						<BarRateStat isPreloading={isPreloading} stat={compoundRate} />
						<BarSignedAmountStat
							isPreloading={isPreloading}
							stat={selfStakeChange}
							unit={unit}
						/>
						<BarSignedAmountStat
							isPreloading={isPreloading}
							stat={netOutflow}
							unit={unit}
						/>
					</BarStats>

					{actions}
				</BarLayout>
			</div>
		</BarWrapper>
	)
}
