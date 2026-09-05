// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { getIdentityDisplay } from 'library/List/Utils'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { FavoriteValidator } from 'library/ListItem/Buttons/FavoriteValidator'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import {
	RetainmentHistory,
	useOpenRetainmentHistory,
} from 'library/ListItem/Buttons/RetainmentHistory'
import { Identity } from 'library/ListItem/Labels/Identity'
import { useNominationStatusData } from 'library/ListItem/Labels/NominationStatus'
import { RowActionsMenu } from 'library/ValidatorList/RowActionsMenu'
import { useValidatorSelfStake } from 'library/ValidatorList/useValidatorSelfStake'
import { ValidatorBar } from 'library/ValidatorList/ValidatorBar'
import { ValidatorCard } from 'library/ValidatorList/ValidatorCard'
import { ValidatorSummary } from 'library/ValidatorList/ValidatorSummary'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { useRetainmentStatsData } from 'ui-app/RetainmentStats'
import { getRateAfterCommission } from 'utils'
import type { ItemProps } from './types'

export const DetailedItem = ({
	validator,
	nominator,
	toggleFavorites,
	bondFor,
	displayFor,
	format,
	nominationStatus = 'waiting',
	eraPoints,
	rate,
	retainment,
	isPreloading = false,
}: ItemProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { validatorIdentities, validatorSupers } = useValidators()
	const { address, prefs, validatorStatus } = validator
	const { unit, units } = getStakingChainData(network)
	const { selfStake, selfStakeMax } = useValidatorSelfStake(address, units)
	const {
		label: statusLabel,
		stakedAmount: backingStake,
		syncing: backingStakePreloading,
	} = useNominationStatusData({
		address,
		bondFor,
		nominator,
		status: nominationStatus,
	})
	const retainmentStats = useRetainmentStatsData({
		period: retainment?.retainment.threeMonths ?? undefined,
		selfStakeMax,
		unit,
		units,
	})
	const outline = displayFor === 'canvas'
	const rateAfterCommission = getRateAfterCommission(rate, prefs?.commission)
	const validatorIdentity = getIdentityDisplay(
		validatorIdentities[address],
		validatorSupers[address],
	)
	const validatorDisplay = validatorIdentity.node
	const retainmentPeriods = retainment?.months.slice(0, 6) ?? []
	const retainmentHistoryDisabled =
		isPreloading || retainmentPeriods.length === 0
	const showRetainmentHistory =
		displayFor !== 'canvas' && displayFor !== 'modal'
	const openRetainmentHistory = useOpenRetainmentHistory({
		periods: retainmentPeriods,
		selfStakeMax,
		unit,
		units,
		validator: address,
		validatorDisplay,
	})
	const onRetainmentHistory = showRetainmentHistory
		? openRetainmentHistory
		: undefined

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
						onRetainmentHistory={onRetainmentHistory}
						retainmentHistoryDisabled={retainmentHistoryDisabled}
						showFavorite={toggleFavorites === true}
						showMetrics={displayFor !== 'canvas'}
					/>
				}
				displayFor={displayFor}
				eraPoints={eraPoints}
				isPreloading={isPreloading}
				isStatusValuePreloading={backingStakePreloading}
				onRetainmentHistory={onRetainmentHistory}
				rate={rateAfterCommission}
				retainmentHistoryDisabled={retainmentHistoryDisabled}
				retainmentStats={retainmentStats}
				selfStake={selfStake}
				selfStakeMax={selfStakeMax}
				statusActive={nominationStatus === 'active'}
				statusLabel={statusLabel}
				statusValue={backingStake}
				unit={unit}
				validator={validator}
			/>
		)
	}

	const cardActions = (
		<ListItem.Actions>
			<ListItem.Action>
				<CopyAddress address={address} />
			</ListItem.Action>
			{toggleFavorites && (
				<ListItem.Action>
					<FavoriteValidator address={address} outline={outline} />
				</ListItem.Action>
			)}
			{displayFor !== 'canvas' && (
				<ListItem.Action wide>
					<Metrics
						address={address}
						display={validatorDisplay}
						outline={outline}
					/>
				</ListItem.Action>
			)}
			{showRetainmentHistory && (
				<ListItem.Action wide>
					<RetainmentHistory
						disabled={retainmentHistoryDisabled}
						onClick={openRetainmentHistory}
					/>
				</ListItem.Action>
			)}
		</ListItem.Actions>
	)

	return (
		<ValidatorCard
			actions={cardActions}
			address={address}
			blocked={prefs?.blocked === true}
			displayFor={displayFor}
			eraPoints={eraPoints}
			identity={<Identity address={address} />}
			isActivityPreloading={isPreloading}
			isRetainmentPreloading={isPreloading}
			retainmentStats={retainmentStats}
			summary={
				<ValidatorSummary
					address={address}
					ariaLabel={t('nominationSummary')}
					isRatePreloading={isPreloading}
					isStatusValuePreloading={backingStakePreloading}
					rate={rateAfterCommission}
					selfStake={selfStake}
					selfStakeMax={selfStakeMax}
					status={validatorStatus}
					statusActive={nominationStatus === 'active'}
					statusLabel={statusLabel}
					statusValue={backingStake}
					unit={unit}
				/>
			}
			unit={unit}
		/>
	)
}
