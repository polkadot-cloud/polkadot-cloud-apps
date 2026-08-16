// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useList } from 'contexts/List'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { getIdentityDisplay } from 'library/List/Utils'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { Remove } from 'library/ListItem/Buttons/Remove'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import type { Validator } from 'types'
import { ListItem } from 'ui-app/ListItem'
import { FavoriteValidator } from '../ListItem/Buttons/FavoriteValidator'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { DetailedItemPreloader } from './DetailedItemPreloader'
import { RowActionsMenu } from './RowActionsMenu'
import { getRateAfterCommission } from './retainment'
import type { ItemProps } from './types'
import { useRetainmentStatsData } from './useRetainmentStatsData'
import { useValidatorSelfStake } from './useValidatorSelfStake'
import { ValidatorBar } from './ValidatorBar'
import { ValidatorCard } from './ValidatorCard'
import { ValidatorSummary } from './ValidatorSummary'

export const DetailedItem = ({
	validator,
	showShareLink = true,
	toggleFavorites,
	displayFor,
	eraPoints,
	onRemove,
	rate,
	format,
	retainment,
	isPreloading,
}: ItemProps) => {
	const { network } = useNetwork()
	const { selectable, selected } = useList()
	const { validatorIdentities, validatorSupers } = useValidators()
	const { address, prefs, validatorStatus } = validator
	const { unit, units } = getStakingChainData(network)
	const { selfStake, selfStakeMax } = useValidatorSelfStake(address, units)
	const retainmentStats = useRetainmentStatsData({
		period: retainment?.months[0],
		selfStakeMax,
		unit,
		units,
	})

	if (isPreloading) {
		return <DetailedItemPreloader format={format} />
	}

	const isSelected = selected.some(
		(item) => (item as Validator).address === validator.address,
	)
	const rateAfterCommission = getRateAfterCommission(rate, prefs?.commission)
	const validatorDisplay = getIdentityDisplay(
		validatorIdentities[address],
		validatorSupers[address],
	).node

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
		</ListItem.Actions>
	)

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
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
				rate={rateAfterCommission}
				retainmentStats={retainmentStats}
				selfStake={selfStake}
				selfStakeMax={selfStakeMax}
				selected={isSelected}
				unit={unit}
				validator={validator}
			/>
		)
	}

	return (
		<ValidatorCard
			actions={cardActions}
			address={address}
			blocked={prefs?.blocked === true}
			displayFor={displayFor}
			eraPoints={eraPoints}
			headerStart={selectable ? <Select item={validator} /> : undefined}
			identity={<Identity address={address} />}
			retainmentStats={retainmentStats}
			selected={isSelected}
			summary={
				<ValidatorSummary
					address={address}
					rate={rateAfterCommission}
					selfStake={selfStake}
					selfStakeMax={selfStakeMax}
					status={validatorStatus}
					unit={unit}
				/>
			}
			unit={unit}
		/>
	)
}
