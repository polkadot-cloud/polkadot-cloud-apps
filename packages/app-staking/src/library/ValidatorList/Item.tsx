// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { getStakingChainData } from 'consts/util'
import { useEraStakers } from 'contexts/EraStakers'
import { useList } from 'contexts/List'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { CurrentEraPoints } from 'library/List/EraPointsGraph/CurrentEraPoints'
import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import { getIdentityDisplay } from 'library/List/Utils'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { Remove } from 'library/ListItem/Buttons/Remove'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { planckToUnitBn } from 'utils'
import { FavoriteValidator } from '../ListItem/Buttons/FavoriteValidator'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { RetainmentStats } from './RetainmentStats'
import type { ItemProps } from './types'
import { ValidatorBar } from './ValidatorBar'
import { ValidatorSummary } from './ValidatorSummary'
import {
	BlockedBadge,
	CardTop,
	HeaderActions,
	HeaderIconAction,
	HeaderIdentity,
	HeaderMetricsAction,
	ItemWrapper,
	PerformanceGraph,
	PerformanceHeader,
	PerformanceRow,
} from './Wrappers'

export const Item = ({
	validator,
	toggleFavorites,
	displayFor,
	eraPoints,
	onRemove,
	rate,
	format,
}: ItemProps) => {
	const { t } = useTranslation('app')
	const { pluginEnabled } = usePlugins()
	const stakingApiEnabled = pluginEnabled('staking_api')
	const { network } = useNetwork()
	const { getActiveValidator } = useEraStakers()
	const { selectable, selected } = useList()
	const { validatorIdentities, validatorSupers } = useValidators()
	const { address, prefs, validatorStatus } = validator
	const commission = prefs?.commission ?? null
	const { unit, units } = getStakingChainData(network)

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
	const validatorOwnStake = getActiveValidator(address)?.own
	const selfStake =
		validatorOwnStake !== undefined
			? planckToUnitBn(new BigNumber(validatorOwnStake), units)
			: undefined
	const actions = (
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
					<Metrics
						address={address}
						display={
							getIdentityDisplay(
								validatorIdentities[address],
								validatorSupers[address],
							).node
						}
					/>
				</HeaderMetricsAction>
			)}
		</HeaderActions>
	)

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={actions}
				innerClasses={innerClasses}
				rate={rateAfterCommission}
				selfStake={selfStake}
				stakingApiEnabled={stakingApiEnabled}
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
						{actions}
					</div>
					<ValidatorSummary
						address={address}
						rate={rateAfterCommission}
						selfStake={selfStake}
						status={validatorStatus}
						unit={unit}
					/>
					<PerformanceRow className="row performance">
						<PerformanceHeader>
							<strong>{t('performance')}</strong>
						</PerformanceHeader>
						<PerformanceGraph>
							{stakingApiEnabled ? (
								<HistoricalEraPoints
									address={address}
									displayFor={displayFor}
									eraPoints={eraPoints}
									stretch
								/>
							) : (
								<CurrentEraPoints
									address={address}
									displayFor={displayFor}
									stretch
								/>
							)}
						</PerformanceGraph>
					</PerformanceRow>
				</CardTop>
				{stakingApiEnabled && (
					<RetainmentStats selfStake={selfStake} unit={unit} />
				)}
			</div>
		</ItemWrapper>
	)
}
