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
import { ListItem } from 'ui-app/ListItem'
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
	canvas?: boolean
	displayFor: DisplayFor
	eraPoints: ValidatorEraPoints[]
	isPreloading?: boolean
	isStatusValuePreloading?: boolean
	rate?: number
	retainmentStats: RetainmentStatsData
	selfStake?: BigNumber
	selfStakeMax: boolean
	selected?: boolean
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
	<ListItem.Metric
		color={stat.color}
		label={stat.label}
		labelProps={{ title: stat.label }}
		valueProps={{
			'aria-label': stat.ariaLabel,
			'aria-valuemax': stat.value === undefined ? undefined : 100,
			'aria-valuemin': stat.value === undefined ? undefined : 0,
			'aria-valuenow': stat.value,
			'aria-valuetext': stat.ariaValueText,
			role: stat.value === undefined ? undefined : 'meter',
		}}
	>
		{isPreloading ? (
			<ListItem.DetailLoader height="1.2rem" width="4.5rem" />
		) : (
			<RetainmentStatValue stat={stat} />
		)}
	</ListItem.Metric>
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
	<ListItem.Metric
		color={stat.color}
		label={stat.label}
		labelProps={{ title: stat.label }}
		valueProps={{ 'aria-label': stat.ariaLabel }}
	>
		{isPreloading ? (
			<ListItem.DetailLoader height="1.2rem" width="4.5rem" />
		) : (
			<RetainmentStatValue stat={stat} unit={unit} />
		)}
	</ListItem.Metric>
)

export const ValidatorBar = ({
	actions,
	canvas = false,
	displayFor,
	eraPoints,
	isPreloading = false,
	isStatusValuePreloading = false,
	rate,
	retainmentStats,
	selfStake,
	selfStakeMax,
	selected = false,
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
		<ListItem.Row canvas={canvas} selected={selected}>
			<ListItem.RowIdentity>
				{selectable && <Select item={validator} />}
				<ListItem.Identity>
					<Identity address={address} />
					{prefs?.blocked === true && (
						<ListItem.Blocked>{t('blocked')}</ListItem.Blocked>
					)}
				</ListItem.Identity>
				<ListItem.Graph
					layout="row"
					aria-label={t('validatorActivity')}
					title={t('validatorActivity')}
				>
					{isPreloading ? (
						<ListItem.DetailLoader
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
				</ListItem.Graph>
			</ListItem.RowIdentity>

			<ListItem.RowMetrics>
				<ListItem.Metric
					label={
						<>
							<ListItem.StatusDot
								active={statusActive ?? validatorStatus === 'active'}
								aria-hidden="true"
							/>
							<span>{summaryStatusLabel}</span>
						</>
					}
					valueProps={{
						'aria-busy': isStatusValuePreloading,
						title: totalStake ? `${totalStake} ${unit}` : undefined,
					}}
				>
					{isStatusValuePreloading ? (
						<ListItem.DetailLoader height="1.2rem" width="4.5rem" />
					) : (
						<>
							<span>{totalStake ?? '—'}</span>
							{totalStake && <small>{unit}</small>}
						</>
					)}
				</ListItem.Metric>
				<ListItem.Metric aria-busy={isPreloading} label="APY">
					{isPreloading ? (
						<ListItem.DetailLoader height="1.2rem" width="4.5rem" />
					) : (
						rateLabel
					)}
				</ListItem.Metric>
				<ListItem.Metric label={t('performance')}>
					{quartileLabel}
				</ListItem.Metric>
				<ListItem.Metric label={t('selfStake', { defaultValue: 'Self stake' })}>
					<span>{selfStakeLabel}</span>
					{selfStake !== undefined && !selfStakeMax && <small>{unit}</small>}
				</ListItem.Metric>
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
			</ListItem.RowMetrics>

			{actions}
		</ListItem.Row>
	)
}
