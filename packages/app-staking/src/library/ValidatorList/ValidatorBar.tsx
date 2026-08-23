// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import { useList } from 'contexts/List'
import type {
	ValidatorActivityTier,
	ValidatorListEntry,
} from 'contexts/Validators/types'
import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import type { ValidatorEraPoints } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { ListItem } from 'ui-app/ListItem'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { ActivityTierValue } from './ActivityTierValue'
import { RetainmentMetric } from './RetainmentStats'
import type { RetainmentStatsData } from './useRetainmentStatsData'
import { useValidatorSummaryData } from './ValidatorSummary'

interface ValidatorBarProps {
	actions: ReactNode
	activityTier?: ValidatorActivityTier | null
	displayFor: DisplayFor
	eraPoints: ValidatorEraPoints[]
	eraPointsSyncing?: boolean
	identityNode?: ReactNode
	isEraPointsPreloading?: boolean
	isPreloading?: boolean
	isRatePreloading?: boolean
	isRetainmentPreloading?: boolean
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

export const ValidatorBar = ({
	actions,
	activityTier,
	displayFor,
	eraPoints,
	eraPointsSyncing,
	identityNode,
	isEraPointsPreloading,
	isPreloading = false,
	isRatePreloading,
	isRetainmentPreloading,
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
		activityColor,
		activityLabel,
		rateLabel,
		selfStakeLabel,
		showActivityTooltip,
		statusLabel: summaryStatusLabel,
		totalStake,
		validatorStatus,
	} = useValidatorSummaryData({
		address,
		activityTier,
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
	const eraPointsPreloading = isEraPointsPreloading ?? isPreloading
	const ratePreloading = isRatePreloading ?? isPreloading
	const retainmentPreloading = isRetainmentPreloading ?? isPreloading

	return (
		<ListItem.Row
			displayFor={displayFor}
			selected={selected}
			statusAccent={retainmentStats.statusAccent}
		>
			<ListItem.RowIdentity>
				{selectable && <Select item={validator} />}
				<ListItem.Identity>
					{identityNode ?? <Identity address={address} />}
					{prefs?.blocked === true && (
						<ListItem.Blocked>{t('blocked')}</ListItem.Blocked>
					)}
				</ListItem.Identity>
				<ListItem.Graph
					layout="row"
					aria-label={t('validatorActivity')}
					title={t('validatorActivity')}
				>
					{eraPointsPreloading ? (
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
							syncing={eraPointsSyncing}
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
				<ListItem.Metric aria-busy={ratePreloading} label="APY">
					{ratePreloading ? (
						<ListItem.DetailLoader height="1.2rem" width="4.5rem" />
					) : (
						rateLabel
					)}
				</ListItem.Metric>
				<ListItem.Metric
					color={activityColor}
					label={t('performance')}
					valueProps={{ style: { overflow: 'hidden' } }}
				>
					<ActivityTierValue
						label={activityLabel}
						showTooltip={showActivityTooltip}
					/>
				</ListItem.Metric>
				<ListItem.Metric label={t('selfStake')}>
					<span>{selfStakeLabel}</span>
					{selfStake !== undefined && !selfStakeMax && <small>{unit}</small>}
				</ListItem.Metric>
				{[retainmentRate, compoundRate].map((stat) => (
					<RetainmentMetric
						compact
						key={stat.label}
						isPreloading={retainmentPreloading}
						stat={stat}
					/>
				))}
				{[selfStakeChange, netOutflow].map((stat) => (
					<RetainmentMetric
						compact
						key={stat.label}
						isPreloading={retainmentPreloading}
						stat={stat}
						unit={unit}
					/>
				))}
			</ListItem.RowMetrics>

			{actions}
		</ListItem.Row>
	)
}
