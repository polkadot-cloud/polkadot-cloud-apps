// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import type { ValidatorEraPoints } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { DetailedCard, ListItem } from 'ui-app/ListItem'
import {
	RetainmentStats,
	type RetainmentStatsData,
	type RetainmentWindow,
	RetainmentWindowToggle,
} from 'ui-app/RetainmentStats'

interface ValidatorCardProps {
	actions: ReactNode
	address: string
	activitySyncing?: boolean
	blocked: boolean
	displayFor: DisplayFor
	eraPoints: ValidatorEraPoints[]
	headerStart?: ReactNode
	identity: ReactNode
	isActivityPreloading?: boolean
	isRetainmentPreloading?: boolean
	onRetainmentWindowChange: (window: RetainmentWindow) => void
	retainmentStats: RetainmentStatsData
	retainmentWindow: RetainmentWindow
	selected?: boolean
	summary: ReactNode
	unit: string
	warnings?: ReactNode
}

export const ValidatorCard = ({
	actions,
	address,
	activitySyncing,
	blocked,
	displayFor,
	eraPoints,
	headerStart,
	identity,
	isActivityPreloading = false,
	isRetainmentPreloading = false,
	onRetainmentWindowChange,
	retainmentStats,
	retainmentWindow,
	selected = false,
	summary,
	unit,
	warnings,
}: ValidatorCardProps) => {
	const { t } = useTranslation('app')

	return (
		<DetailedCard.Root
			displayFor={displayFor}
			selected={selected}
			statusAccent={retainmentStats.statusAccent}
		>
			<DetailedCard.Top>
				<DetailedCard.Header>
					{headerStart}
					<ListItem.Identity>
						{identity}
						{blocked && <ListItem.Blocked>{t('blocked')}</ListItem.Blocked>}
					</ListItem.Identity>
					{actions}
				</DetailedCard.Header>
				{summary}
				<ListItem.Activity aria-busy={isActivityPreloading}>
					<ListItem.SectionHeader>
						<strong>{t('activity')}</strong>
					</ListItem.SectionHeader>
					<ListItem.Graph layout="card">
						{isActivityPreloading ? (
							<div>
								<ListItem.DetailLoader
									borderRadius="0.45rem"
									height="100%"
									width="100%"
								/>
							</div>
						) : (
							<HistoricalEraPoints
								address={address}
								displayFor={displayFor}
								eraPoints={eraPoints}
								stretch
								syncing={activitySyncing}
							/>
						)}
					</ListItem.Graph>
				</ListItem.Activity>
			</DetailedCard.Top>
			<RetainmentStats
				data={retainmentStats}
				isPreloading={isRetainmentPreloading}
				unit={unit}
				windowToggle={
					<RetainmentWindowToggle
						alignEnd
						disabled={isRetainmentPreloading}
						onChange={onRetainmentWindowChange}
						value={retainmentWindow}
					/>
				}
			/>
			{warnings}
		</DetailedCard.Root>
	)
}
