// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import type { ListFormat } from 'contexts/List/types'
import { getActivityTier } from 'contexts/Validators/Utils'
import { useNetwork } from 'hooks/useNetwork'
import { useHardCapSelfStake } from 'hooks/useStakingMetrics'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { FavoriteValidator } from 'library/ListItem/Buttons/FavoriteValidator'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { RetainmentHistory } from 'library/ListItem/Buttons/RetainmentHistory'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import { Identity } from 'library/ListItem/Labels/Identity'
import { RowActionsMenu } from 'library/ValidatorList/RowActionsMenu'
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
import { useRetainmentStatsData } from 'ui-app/RetainmentStats'
import { useOverlay } from 'ui-overlay'
import { getRateAfterCommission, isMaxSelfStake, planckToUnitBn } from 'utils'

interface ItemProps {
	eraPoints: ValidatorEraPoints[]
	format: ListFormat
	isEraPointsLoading: boolean
	isRateLoading: boolean
	rate?: number
	showShareLink: boolean
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

export const Item = ({
	eraPoints,
	format,
	isEraPointsLoading,
	isRateLoading,
	rate,
	showShareLink,
	toggleFavorites,
	totalActive,
	validator,
}: ItemProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { openModal } = useOverlay().modal
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
	const activityTier =
		validator.activityRank === null
			? ('notRated' as const)
			: (getActivityTier(validator.activityRank, totalActive) ?? null)
	const validatorStatus = validator.active
		? ('active' as const)
		: ('waiting' as const)
	const validatorEntry = {
		address,
		prefs,
		validatorStatus,
	}
	const retainmentHistoryDisabled = validator.retainment === null
	const openRetainmentHistory = () =>
		openModal({
			key: 'RetainmentHistory',
			size: 'sm',
			options: {
				selfStakeMax,
				unit,
				units,
				validator: address,
				validatorDisplay,
			},
		})

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
						onRetainmentHistory={openRetainmentHistory}
						retainmentHistoryDisabled={retainmentHistoryDisabled}
						showFavorite={toggleFavorites}
						showMetrics
						showShareLink={showShareLink}
					/>
				}
				activityTier={activityTier}
				displayFor="default"
				eraPoints={eraPoints}
				eraPointsSyncing={false}
				identityNode={identity}
				isEraPointsPreloading={isEraPointsLoading}
				isRatePreloading={isRateLoading}
				isRetainmentPreloading={false}
				rate={rateAfterCommission}
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
			{showShareLink && (
				<ListItem.Action>
					<ShareLink paramKey="v" paramValue={address} />
				</ListItem.Action>
			)}
			{toggleFavorites && (
				<ListItem.Action>
					<FavoriteValidator address={address} />
				</ListItem.Action>
			)}
			<ListItem.Action wide>
				<Metrics address={address} display={validatorDisplay} />
			</ListItem.Action>
			<ListItem.Action wide>
				<RetainmentHistory
					disabled={retainmentHistoryDisabled}
					onClick={openRetainmentHistory}
				/>
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
					activityTier={activityTier}
					isRatePreloading={isRateLoading}
					rate={rateAfterCommission}
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
