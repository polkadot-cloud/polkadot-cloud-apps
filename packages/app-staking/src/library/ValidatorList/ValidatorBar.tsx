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
import {
	RetainmentMetric,
	type RetainmentStatsData,
} from 'ui-app/RetainmentStats'
import { RetainmentHistory } from '../ListItem/Buttons/RetainmentHistory'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { ValidatorSummaryMetrics } from './ValidatorSummary'

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
	onRetainmentHistory?: () => void
	rate?: number
	retainmentHistoryDisabled?: boolean
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
	onRetainmentHistory,
	rate,
	retainmentHistoryDisabled = false,
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
		compoundRate,
		netOutflow,
		retainmentLabel,
		retainmentRate,
		selfStakeChange,
	} = retainmentStats
	const eraPointsPreloading = isEraPointsPreloading ?? isPreloading
	const ratePreloading = isRatePreloading ?? isPreloading
	const retainmentPreloading = isRetainmentPreloading ?? isPreloading

	return (
		<ListItem.Row
			displayFor={displayFor}
			rowVariant="validator"
			selected={selected}
			statusAccent={retainmentStats.statusAccent}
		>
			<ListItem.RowHeader data-section="identity">
				{t('identity')}
			</ListItem.RowHeader>
			<ListItem.RowHeader data-section="performance">
				{t('performance')}
			</ListItem.RowHeader>
			<ListItem.RowHeader data-section="retainment">
				<span>{retainmentLabel}</span>
				{onRetainmentHistory && (
					<RetainmentHistory
						disabled={retainmentHistoryDisabled}
						iconOnly
						onClick={onRetainmentHistory}
					/>
				)}
			</ListItem.RowHeader>
			<ListItem.RowIdentity>
				{selectable && <Select item={validator} />}
				<ListItem.Identity>
					{identityNode ?? <Identity address={address} />}
					{prefs?.blocked === true && (
						<ListItem.Blocked>{t('blocked')}</ListItem.Blocked>
					)}
				</ListItem.Identity>
			</ListItem.RowIdentity>

			<ListItem.RowPerformance>
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
				<ListItem.RowMetricGroup data-section="performance">
					<ValidatorSummaryMetrics
						activityTier={activityTier}
						address={address}
						compact
						isRatePreloading={ratePreloading}
						isStatusValuePreloading={isStatusValuePreloading}
						rate={rate}
						selfStake={selfStake}
						selfStakeMax={selfStakeMax}
						status={status}
						statusActive={statusActive}
						statusLabel={statusLabel}
						statusValue={statusValue}
						unit={unit}
					/>
				</ListItem.RowMetricGroup>
			</ListItem.RowPerformance>

			<ListItem.RowMetricGroup
				aria-label={retainmentLabel}
				data-section="retainment"
				role="group"
			>
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
			</ListItem.RowMetricGroup>

			{actions}
		</ListItem.Row>
	)
}
