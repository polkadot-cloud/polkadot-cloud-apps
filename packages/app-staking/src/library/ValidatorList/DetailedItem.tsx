// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { getStakingChainData } from 'consts/util'
import { useList } from 'contexts/List'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import { getIdentityDisplay } from 'library/List/Utils'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { Remove } from 'library/ListItem/Buttons/Remove'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import {
	BlockedBadge,
	CardTop,
	HeaderActions,
	HeaderIconAction,
	HeaderIdentity,
	HeaderMetricsAction,
	ItemWrapper,
	PerformanceGraph,
	PerformanceRow,
	SectionHeader,
} from 'ui-app/ListItem'
import { FavoriteValidator } from '../ListItem/Buttons/FavoriteValidator'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { DetailedItemPreloader } from './DetailedItemPreloader'
import { RetainmentStats } from './RetainmentStats'
import { RowActionsMenu } from './RowActionsMenu'
import type { ItemProps } from './types'
import { useRetainmentStatsData } from './useRetainmentStatsData'
import { useValidatorSelfStake } from './useValidatorSelfStake'
import { ValidatorBar } from './ValidatorBar'
import { ValidatorSummary } from './ValidatorSummary'

export const DetailedItem = ({
	validator,
	toggleFavorites,
	displayFor,
	eraPoints,
	onRemove,
	rate,
	format,
	retainment,
	isPreloading,
}: ItemProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { selectable, selected } = useList()
	const { validatorIdentities, validatorSupers } = useValidators()
	const { address, prefs, validatorStatus } = validator
	const commission = prefs?.commission ?? null
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

	const isSelected = !!selected.filter(
		(item) => (item as Validator).address === validator.address,
	).length

	const innerClasses = classNames('inner', {
		[displayFor]: true,
		selected: isSelected,
	})

	// Rate after commission
	const rateAfterCommission =
		typeof rate === 'number' &&
		Number.isFinite(rate) &&
		typeof commission === 'number' &&
		Number.isFinite(commission)
			? rate * (1 - commission / 100)
			: undefined
	const validatorDisplay = getIdentityDisplay(
		validatorIdentities[address],
		validatorSupers[address],
	).node

	const cardActions = (
		<HeaderActions>
			<HeaderIconAction>
				<CopyAddress address={address} />
			</HeaderIconAction>
			<HeaderIconAction>
				<ShareLink paramKey="v" paramValue={address} />
			</HeaderIconAction>
			{toggleFavorites && (
				<HeaderIconAction>
					<FavoriteValidator address={address} />
				</HeaderIconAction>
			)}
			{typeof onRemove === 'function' && (
				<HeaderIconAction>
					<Remove
						address={address}
						onRemove={() => onRemove({ selected: [validator] })}
						displayFor={displayFor}
					/>
				</HeaderIconAction>
			)}
			{displayFor === 'default' && (
				<HeaderMetricsAction>
					<Metrics address={address} display={validatorDisplay} />
				</HeaderMetricsAction>
			)}
		</HeaderActions>
	)

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
						onRemove={
							typeof onRemove === 'function'
								? () => onRemove({ selected: [validator] })
								: undefined
						}
						showFavorite={toggleFavorites === true}
						showMetrics={displayFor === 'default'}
					/>
				}
				innerClasses={innerClasses}
				displayFor={displayFor}
				eraPoints={eraPoints}
				rate={rateAfterCommission}
				retainmentStats={retainmentStats}
				selfStake={selfStake}
				selfStakeMax={selfStakeMax}
				unit={unit}
				validator={validator}
			/>
		)
	}

	return (
		<ItemWrapper>
			<div className={innerClasses}>
				<CardTop className="card-top">
					<div className="row top">
						{selectable && <Select item={validator} />}
						<HeaderIdentity>
							<Identity address={address} />
							{prefs?.blocked === true && (
								<BlockedBadge>{t('blocked')}</BlockedBadge>
							)}
						</HeaderIdentity>
						{cardActions}
					</div>
					<ValidatorSummary
						address={address}
						rate={rateAfterCommission}
						selfStake={selfStake}
						selfStakeMax={selfStakeMax}
						status={validatorStatus}
						unit={unit}
					/>
					<PerformanceRow className="row performance">
						<SectionHeader>
							<strong>{t('activity')}</strong>
						</SectionHeader>
						<PerformanceGraph>
							<HistoricalEraPoints
								address={address}
								displayFor={displayFor}
								eraPoints={eraPoints}
								stretch
							/>
						</PerformanceGraph>
					</PerformanceRow>
				</CardTop>
				<RetainmentStats data={retainmentStats} unit={unit} />
			</div>
		</ItemWrapper>
	)
}
