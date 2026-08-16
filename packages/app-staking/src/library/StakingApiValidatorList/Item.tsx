// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import type { ListFormat } from 'contexts/List/types'
import { useNetwork } from 'hooks/useNetwork'
import { useHardCapSelfStake } from 'hooks/useStakingMetrics'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { FavoriteValidator } from 'library/ListItem/Buttons/FavoriteValidator'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import { Identity } from 'library/ListItem/Labels/Identity'
import { RowActionsMenu } from 'library/ValidatorList/RowActionsMenu'
import {
	getRateAfterCommission,
	isMaxSelfStake,
} from 'library/ValidatorList/retainment'
import { useRetainmentStatsData } from 'library/ValidatorList/useRetainmentStatsData'
import { ValidatorBar } from 'library/ValidatorList/ValidatorBar'
import { ValidatorCard } from 'library/ValidatorList/ValidatorCard'
import { ValidatorSummary } from 'library/ValidatorList/ValidatorSummary'
import type {
	ValidatorEraPoints,
	ValidatorListItem,
} from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { planckToUnitBn } from 'utils'

interface ItemProps {
	eraPoints: ValidatorEraPoints[]
	format: ListFormat
	isEraPointsLoading: boolean
	isRateLoading: boolean
	rate?: number
	toggleFavorites: boolean
	totalActive: number
	validator: ValidatorListItem
}

const getIdentityDisplay = (validator: ValidatorListItem): ReactNode => {
	const display =
		validator.identity?.superDisplay || validator.identity?.display || ''
	const superValue = validator.identity?.superValue || ''

	return display ? (
		<>
			{display}
			{superValue && <span>/ {superValue}</span>}
		</>
	) : null
}

const getRankSegment = (validator: ValidatorListItem, totalActive: number) =>
	validator.activityRank && totalActive > 0
		? Math.min(100, Math.ceil((validator.activityRank / totalActive) * 10) * 10)
		: undefined

export const Item = ({
	eraPoints,
	format,
	isEraPointsLoading,
	isRateLoading,
	rate,
	toggleFavorites,
	totalActive,
	validator,
}: ItemProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const hardCapSelfStake = useHardCapSelfStake()
	const { unit, units } = getStakingChainData(network)
	const { address, prefs } = validator
	const selfStakePlanck = validator.selfStake
		? new BigNumber(validator.selfStake)
		: undefined
	const selfStake = selfStakePlanck
		? planckToUnitBn(selfStakePlanck, units)
		: undefined
	const selfStakeMax = isMaxSelfStake(selfStakePlanck, hardCapSelfStake)
	const rateAfterCommission = getRateAfterCommission(rate, prefs.commission)
	const retainmentStats = useRetainmentStatsData({
		period: validator.retainment ?? undefined,
		selfStakeMax,
		unit,
		units,
	})
	const validatorDisplay = getIdentityDisplay(validator)
	const identity = <Identity address={address} display={validatorDisplay} />
	const totalStake = validator.totalStake
		? planckToUnitBn(new BigNumber(validator.totalStake), units)
		: undefined
	const rankSegment = getRankSegment(validator, totalActive)
	const validatorStatus = validator.active
		? ('active' as const)
		: ('waiting' as const)
	const validatorEntry = {
		address,
		prefs,
		validatorStatus,
	}

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
						showFavorite={toggleFavorites}
						showMetrics
					/>
				}
				displayFor="default"
				eraPoints={eraPoints}
				eraPointsSyncing={false}
				identityNode={identity}
				isEraPointsPreloading={isEraPointsLoading}
				isRatePreloading={isRateLoading}
				isRetainmentPreloading={false}
				rate={rateAfterCommission}
				rankSegment={rankSegment}
				retainmentStats={retainmentStats}
				selfStake={selfStake}
				selfStakeMax={selfStakeMax}
				statusActive={validator.active}
				statusLabel={t(validatorStatus)}
				statusValue={totalStake}
				unit={unit}
				validator={validatorEntry}
			/>
		)
	}

	const actions = (
		<ListItem.Actions>
			<ListItem.Action>
				<CopyAddress address={address} />
			</ListItem.Action>
			<ListItem.Action>
				<ShareLink paramKey="v" paramValue={address} />
			</ListItem.Action>
			{toggleFavorites && (
				<ListItem.Action>
					<FavoriteValidator address={address} />
				</ListItem.Action>
			)}
			<ListItem.Action wide>
				<Metrics address={address} display={validatorDisplay} />
			</ListItem.Action>
		</ListItem.Actions>
	)

	return (
		<ValidatorCard
			actions={actions}
			address={address}
			activitySyncing={false}
			blocked={prefs.blocked}
			displayFor="default"
			eraPoints={eraPoints}
			identity={identity}
			isActivityPreloading={isEraPointsLoading}
			retainmentStats={retainmentStats}
			summary={
				<ValidatorSummary
					address={address}
					isRatePreloading={isRateLoading}
					rate={rateAfterCommission}
					rankSegment={rankSegment}
					selfStake={selfStake}
					selfStakeMax={selfStakeMax}
					status={validatorStatus}
					statusActive={validator.active}
					statusLabel={t(validatorStatus)}
					statusValue={totalStake}
					unit={unit}
				/>
			}
			unit={unit}
		/>
	)
}
