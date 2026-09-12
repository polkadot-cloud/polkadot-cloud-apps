// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useList } from 'contexts/List'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { getValidatorItemWarnings } from 'library/GenerateNominations/utils'
import { getIdentityDisplay } from 'library/List/Utils'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { Remove } from 'library/ListItem/Buttons/Remove'
import {
	RetainmentHistory,
	useOpenRetainmentHistory,
} from 'library/ListItem/Buttons/RetainmentHistory'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import type { Validator } from 'types'
import { ListItem } from 'ui-app/ListItem'
import {
	useRetainmentStatsData,
	useRetainmentWindow,
} from 'ui-app/RetainmentStats'
import { getRateAfterCommission } from 'utils'
import { FavoriteValidator } from '../ListItem/Buttons/FavoriteValidator'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { DetailedItemPreloader } from './DetailedItemPreloader'
import { RowActionsMenu } from './RowActionsMenu'
import type { ItemProps } from './types'
import { useValidatorSelfStake } from './useValidatorSelfStake'
import { ValidatorBar } from './ValidatorBar'
import { ValidatorCard } from './ValidatorCard'
import { ValidatorSummary } from './ValidatorSummary'
import { ValidatorWarnings } from './ValidatorWarnings'

export const DetailedItem = ({
	validator,
	showShareLink = true,
	toggleFavorites,
	displayFor,
	eraPoints,
	onRemove,
	rate,
	format,
	highlightRetainmentWarnings,
	retainment,
	warnings,
	isPreloading,
}: ItemProps) => {
	const { network } = useNetwork()
	const retainmentEnabled = useRetainmentStatsEnabled()
	const { selectable, selected } = useList()
	const { validatorIdentities, validatorSupers, getValidatorPrefs } =
		useValidators([validator.address])
	const { address, validatorStatus, overview } = validator
	const resolvedPrefs = getValidatorPrefs(address)
	const prefs = resolvedPrefs === undefined ? validator.prefs : resolvedPrefs
	const { unit, units } = getStakingChainData(network)
	const { selfStake, selfStakeMax } = useValidatorSelfStake(overview, units)
	const {
		period,
		window: retainmentWindow,
		setWindow: setRetainmentWindow,
	} = useRetainmentWindow(retainment?.retainment)
	const itemWarnings =
		retainmentEnabled && highlightRetainmentWarnings
			? getValidatorItemWarnings(warnings, retainment)
			: []
	const retainmentStats = useRetainmentStatsData({
		period,
		selfStakeMax,
		statusAccent: itemWarnings[0]?.severity,
		unit,
		units,
	})
	const warningBadges = (
		<ValidatorWarnings warnings={itemWarnings} format={format} />
	)
	const validatorIdentity = getIdentityDisplay(
		validatorIdentities[address],
		validatorSupers[address],
	)
	const validatorDisplay = validatorIdentity.node
	const retainmentPeriods = retainment?.months.slice(0, 6) ?? []
	const showRetainmentHistory =
		retainmentEnabled && displayFor !== 'canvas' && displayFor !== 'modal'
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

	// Without retainment, keep the shorter layout and preload only the pending metrics.
	if (isPreloading && retainmentEnabled) {
		return <DetailedItemPreloader format={format} />
	}

	const isSelected = selected.some(
		(item) => (item as Validator).address === validator.address,
	)
	const rateAfterCommission = getRateAfterCommission(rate, prefs?.commission)

	const cardActions = (
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
			{typeof onRemove === 'function' && (
				<ListItem.Action>
					<Remove
						address={address}
						onRemove={() => onRemove({ selected: [validator] })}
						displayFor={displayFor}
					/>
				</ListItem.Action>
			)}

			{displayFor === 'default' && (
				<ListItem.Action wide>
					<Metrics address={address} display={validatorDisplay} />
				</ListItem.Action>
			)}
			{showRetainmentHistory && (
				<ListItem.Action wide>
					<RetainmentHistory
						disabled={retainmentPeriods.length === 0}
						onClick={openRetainmentHistory}
					/>
				</ListItem.Action>
			)}
		</ListItem.Actions>
	)

	if (format === 'row') {
		return (
			<ValidatorBar
				showRetainment={retainmentEnabled}
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
						onRetainmentHistory={onRetainmentHistory}
						retainmentHistoryDisabled={retainmentPeriods.length === 0}
						showShareLink={showShareLink}
						onRemove={
							typeof onRemove === 'function'
								? () => onRemove({ selected: [validator] })
								: undefined
						}
						showFavorite={toggleFavorites === true}
						showMetrics={displayFor === 'default'}
					/>
				}
				displayFor={displayFor}
				eraPoints={eraPoints}
				isPreloading={isPreloading}
				onRetainmentHistory={onRetainmentHistory}
				rate={rateAfterCommission}
				retainmentHistoryDisabled={retainmentPeriods.length === 0}
				retainmentStats={retainmentStats}
				retainmentWindow={retainmentWindow}
				onRetainmentWindowChange={setRetainmentWindow}
				selfStake={selfStake}
				selfStakeMax={selfStakeMax}
				selected={isSelected}
				unit={unit}
				validator={{ ...validator, prefs }}
				warnings={warningBadges}
			/>
		)
	}

	return (
		<ValidatorCard
			showRetainment={retainmentEnabled}
			actions={cardActions}
			address={address}
			blocked={prefs?.blocked === true}
			displayFor={displayFor}
			eraPoints={eraPoints}
			isActivityPreloading={isPreloading}
			headerStart={selectable ? <Select item={validator} /> : undefined}
			identity={<Identity address={address} />}
			retainmentStats={retainmentStats}
			retainmentWindow={retainmentWindow}
			onRetainmentWindowChange={setRetainmentWindow}
			selected={isSelected}
			summary={
				<ValidatorSummary
					overview={overview}
					overviewUnavailable={validator.overviewUnavailable}
					address={address}
					isRatePreloading={isPreloading}
					rate={rateAfterCommission}
					selfStake={selfStake}
					selfStakeMax={selfStakeMax}
					status={validatorStatus}
					unit={unit}
				/>
			}
			unit={unit}
			warnings={warningBadges}
		/>
	)
}
