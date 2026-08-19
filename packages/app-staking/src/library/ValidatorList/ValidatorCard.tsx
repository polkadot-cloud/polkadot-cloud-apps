// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import type { ValidatorEraPoints } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { DetailedCard, ListItem } from 'ui-app/ListItem'
import { RetainmentStats } from './RetainmentStats'
import type { RetainmentStatsData } from './useRetainmentStatsData'

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
	retainmentStats: RetainmentStatsData
	selected?: boolean
	statusAccent?: 'warning' | 'danger'
	summary: ReactNode
	unit: string
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
	retainmentStats,
	selected = false,
	statusAccent,
	summary,
	unit,
}: ValidatorCardProps) => {
	const { t } = useTranslation('app')

	return (
		<DetailedCard.Root
			displayFor={displayFor}
			selected={selected}
			statusAccent={statusAccent}
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
			/>
		</DetailedCard.Root>
	)
}
