// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { getIdentityDisplay } from 'library/List/Utils'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { FavoriteValidator } from 'library/ListItem/Buttons/FavoriteValidator'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { Identity } from 'library/ListItem/Labels/Identity'
import { useNominationStatusData } from 'library/ListItem/Labels/NominationStatus'
import { RetainmentStats } from 'library/ValidatorList/RetainmentStats'
import { RowActionsMenu } from 'library/ValidatorList/RowActionsMenu'
import { useRetainmentStatsData } from 'library/ValidatorList/useRetainmentStatsData'
import { useValidatorSelfStake } from 'library/ValidatorList/useValidatorSelfStake'
import { ValidatorBar } from 'library/ValidatorList/ValidatorBar'
import { ValidatorSummary } from 'library/ValidatorList/ValidatorSummary'
import { useTranslation } from 'react-i18next'
import {
	BlockedBadge,
	CardTop,
	DetailLoader,
	HeaderActions,
	HeaderIconAction,
	HeaderIdentity,
	HeaderMetricsAction,
	ItemWrapper,
	PerformanceGraph,
	PerformanceRow,
	SectionHeader,
} from 'ui-app/ListItem'
import { HistoricalEraPoints } from '../List/EraPointsGraph/HistoricalEraPoints'
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
	const commission = prefs?.commission ?? null
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
		period: retainment?.months[0],
		selfStakeMax,
		unit,
		units,
	})
	const outline = displayFor === 'canvas'
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

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
						showFavorite={toggleFavorites === true}
						showMetrics={displayFor !== 'canvas'}
					/>
				}
				displayFor={displayFor}
				eraPoints={eraPoints}
				innerClasses={`inner ${displayFor}`}
				isPreloading={isPreloading}
				isStatusValuePreloading={backingStakePreloading}
				rate={rateAfterCommission}
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

	return (
		<ItemWrapper>
			<div className={`inner ${displayFor}`}>
				<CardTop className="card-top">
					<div className="row top">
						<HeaderIdentity>
							<Identity address={address} />
							{prefs?.blocked === true && (
								<BlockedBadge>{t('blocked')}</BlockedBadge>
							)}
						</HeaderIdentity>
						<HeaderActions>
							<HeaderIconAction>
								<CopyAddress address={address} />
							</HeaderIconAction>
							{toggleFavorites && (
								<HeaderIconAction>
									<FavoriteValidator address={address} outline={outline} />
								</HeaderIconAction>
							)}
							{displayFor !== 'canvas' && (
								<HeaderMetricsAction>
									<Metrics
										address={address}
										display={validatorDisplay}
										outline={outline}
									/>
								</HeaderMetricsAction>
							)}
						</HeaderActions>
					</div>
					<ValidatorSummary
						address={address}
						ariaLabel={t('nominationSummary', {
							defaultValue: 'Nomination summary',
						})}
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
					<PerformanceRow className="row performance" aria-busy={isPreloading}>
						<SectionHeader>
							<strong>{t('performance')}</strong>
						</SectionHeader>
						<PerformanceGraph>
							{isPreloading ? (
								<div>
									<DetailLoader
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
								/>
							)}
						</PerformanceGraph>
					</PerformanceRow>
				</CardTop>
				<RetainmentStats
					data={retainmentStats}
					isPreloading={isPreloading}
					unit={unit}
				/>
			</div>
		</ItemWrapper>
	)
}
