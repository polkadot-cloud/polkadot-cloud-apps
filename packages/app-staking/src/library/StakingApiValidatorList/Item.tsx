// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import type { ListFormat } from 'contexts/List/types'
import { useNetwork } from 'hooks/useNetwork'
import { useHardCapSelfStake } from 'hooks/useStakingMetrics'
import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { FavoriteValidator } from 'library/ListItem/Buttons/FavoriteValidator'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import { RetainmentStats } from 'library/ValidatorList/RetainmentStats'
import { RowActionsMenu } from 'library/ValidatorList/RowActionsMenu'
import { isMaxSelfStake } from 'library/ValidatorList/retainment'
import { useRetainmentStatsData } from 'library/ValidatorList/useRetainmentStatsData'
import { ValidatorBar } from 'library/ValidatorList/ValidatorBar'
import type {
	ValidatorEraPoints,
	ValidatorListItem,
} from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DetailedCard, ListItem } from 'ui-app/ListItem'
import { Identity as IdentityWrapper } from 'ui-core/list'
import { formatCompactNumber, planckToUnitBn } from 'utils'

interface ItemProps {
	eraPoints: ValidatorEraPoints[]
	format: ListFormat
	isEraPointsLoading: boolean
	isRateLoading: boolean
	rate?: number
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

const Identity = ({ validator }: { validator: ValidatorListItem }) => {
	const display = getIdentityDisplay(validator)

	return (
		<IdentityWrapper>
			<div
				style={{
					border: '0.1rem solid transparent',
					maxWidth: '2.2rem',
					minWidth: '2.2rem',
				}}
			>
				<Polkicon address={validator.address} fontSize="2.2rem" />
			</div>
			<div>
				<h4>{display ?? ellipsisFn(validator.address, 6)}</h4>
			</div>
		</IdentityWrapper>
	)
}

const Summary = ({
	isRateLoading,
	rate,
	selfStake,
	selfStakeMax,
	totalActive,
	validator,
}: {
	isRateLoading: boolean
	rate?: number
	selfStake?: BigNumber
	selfStakeMax: boolean
	totalActive: number
	validator: ValidatorListItem
}) => {
	const { t, i18n } = useTranslation('app')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const totalStake = validator.totalStake
		? planckToUnitBn(new BigNumber(validator.totalStake), units)
		: undefined
	const totalStakeLabel = totalStake
		? formatCompactNumber(totalStake.toNumber(), i18n.resolvedLanguage)
		: '—'
	const rateLabel =
		typeof rate === 'number' && Number.isFinite(rate)
			? `${new BigNumber(rate).decimalPlaces(2).toString()}%`
			: '—'
	const rankSegment = getRankSegment(validator, totalActive)
	const performanceLabel =
		rankSegment && rankSegment < 100 ? `${t('top')} ${rankSegment}%` : '—'
	const selfStakeLabel = selfStakeMax
		? 'MAX'
		: selfStake
			? formatCompactNumber(selfStake.toNumber(), i18n.resolvedLanguage)
			: '—'

	return (
		<ListItem.Summary
			aria-label={t('validatorSummary', {
				defaultValue: 'Validator summary',
			})}
		>
			<ListItem.Metric
				label={
					<>
						<ListItem.StatusDot active={validator.active} aria-hidden="true" />
						<span>{validator.active ? t('active') : t('waiting')}</span>
					</>
				}
				valueProps={{
					title: totalStake ? `${totalStake.toFormat()} ${unit}` : undefined,
				}}
			>
				<span>{totalStakeLabel}</span>
				{totalStake && <small>{unit}</small>}
			</ListItem.Metric>
			<ListItem.Metric aria-busy={isRateLoading} label="APY">
				{isRateLoading ? <ListItem.DetailLoader /> : rateLabel}
			</ListItem.Metric>
			<ListItem.Metric label={t('performance')}>
				{performanceLabel}
			</ListItem.Metric>
			<ListItem.Metric label={t('selfStake', { defaultValue: 'Self stake' })}>
				<span>{selfStakeLabel}</span>
				{selfStake && !selfStakeMax && <small>{unit}</small>}
			</ListItem.Metric>
		</ListItem.Summary>
	)
}

export const Item = ({
	eraPoints,
	format,
	isEraPointsLoading,
	isRateLoading,
	rate,
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
	const rateAfterCommission =
		typeof rate === 'number' && Number.isFinite(rate)
			? rate * (1 - prefs.commission / 100)
			: undefined
	const retainmentStats = useRetainmentStatsData({
		period: validator.retainment ?? undefined,
		selfStakeMax,
		unit,
		units,
	})
	const validatorDisplay = getIdentityDisplay(validator)
	const totalStake = validator.totalStake
		? planckToUnitBn(new BigNumber(validator.totalStake), units)
		: undefined
	const validatorEntry = {
		address,
		prefs,
		validatorStatus: validator.active
			? ('active' as const)
			: ('waiting' as const),
	}

	if (format === 'row') {
		return (
			<ValidatorBar
				actions={
					<RowActionsMenu
						address={address}
						display={validatorDisplay}
						showFavorite
						showMetrics
					/>
				}
				displayFor="default"
				eraPoints={eraPoints}
				eraPointsSyncing={false}
				identityNode={<Identity validator={validator} />}
				isEraPointsPreloading={isEraPointsLoading}
				isRatePreloading={isRateLoading}
				isRetainmentPreloading={false}
				rate={rateAfterCommission}
				rankSegment={getRankSegment(validator, totalActive)}
				retainmentStats={retainmentStats}
				selfStake={selfStake}
				selfStakeMax={selfStakeMax}
				statusActive={validator.active}
				statusLabel={validator.active ? t('active') : t('waiting')}
				statusValue={totalStake}
				unit={unit}
				validator={validatorEntry}
			/>
		)
	}

	return (
		<DetailedCard.Root>
			<DetailedCard.Top>
				<DetailedCard.Header>
					<ListItem.Identity>
						<Identity validator={validator} />
						{prefs.blocked && (
							<ListItem.Blocked>{t('blocked')}</ListItem.Blocked>
						)}
					</ListItem.Identity>
					<ListItem.Actions>
						<ListItem.Action>
							<CopyAddress address={address} />
						</ListItem.Action>
						<ListItem.Action>
							<ShareLink paramKey="v" paramValue={address} />
						</ListItem.Action>
						<ListItem.Action>
							<FavoriteValidator address={address} />
						</ListItem.Action>
						<ListItem.Action wide>
							<Metrics address={address} display={validatorDisplay} />
						</ListItem.Action>
					</ListItem.Actions>
				</DetailedCard.Header>
				<Summary
					isRateLoading={isRateLoading}
					rate={rateAfterCommission}
					selfStake={selfStake}
					selfStakeMax={selfStakeMax}
					totalActive={totalActive}
					validator={validator}
				/>
				<ListItem.Activity aria-busy={isEraPointsLoading}>
					<ListItem.SectionHeader>
						<strong>{t('activity')}</strong>
					</ListItem.SectionHeader>
					<ListItem.Graph layout="card">
						{isEraPointsLoading ? (
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
								displayFor="default"
								eraPoints={eraPoints}
								stretch
								syncing={false}
							/>
						)}
					</ListItem.Graph>
				</ListItem.Activity>
			</DetailedCard.Top>
			<RetainmentStats data={retainmentStats} unit={unit} />
		</DetailedCard.Root>
	)
}
