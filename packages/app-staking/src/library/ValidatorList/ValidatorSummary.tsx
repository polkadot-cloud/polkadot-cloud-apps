// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import type { ValidatorActivityTier } from 'contexts/Validators/types'
import { useValidators as useValidatorEntries } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { useTranslation } from 'react-i18next'
import type { ValidatorStatus } from 'types'
import { ListItem } from 'ui-app/ListItem'
import { formatCompactNumber, planckToUnitBn } from 'utils'
import { ActivityTier } from '../ListItem/Labels/ActivityTier'

interface ValidatorSummaryProps {
	address: string
	activityTier?: ValidatorActivityTier | null
	ariaLabel?: string
	isRatePreloading?: boolean
	isStatusValuePreloading?: boolean
	rate?: number
	selfStake?: BigNumber
	selfStakeMax: boolean
	status: ValidatorStatus
	statusActive?: boolean
	statusLabel?: string
	statusValue?: BigNumber
	unit: string
}

export const useValidatorSummaryData = ({
	address,
	rate,
	selfStake,
	selfStakeMax,
	status,
	statusLabel: statusLabelOverride,
	statusValue,
}: ValidatorSummaryProps) => {
	const { t, i18n } = useTranslation('app')
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { getValidatorTotalStake } = useValidatorEntries()
	const { units } = getStakingChainData(network)

	const validatorStatus = syncing ? 'waiting' : status
	const statusLabel =
		statusLabelOverride ??
		(syncing
			? t('syncing')
			: validatorStatus === 'waiting'
				? capitalizeFirstLetter(t(validatorStatus) ?? '')
				: t('listItemActive'))
	const totalStake =
		statusValue !== undefined
			? statusValue.isGreaterThan(0)
				? formatCompactNumber(statusValue.toNumber(), i18n.resolvedLanguage)
				: undefined
			: !syncing && validatorStatus !== 'waiting'
				? planckToUnitBn(new BigNumber(getValidatorTotalStake(address)), units)
						.integerValue()
						.toFormat()
				: undefined

	const rateLabel =
		typeof rate === 'number' && Number.isFinite(rate)
			? `${new BigNumber(rate).decimalPlaces(2).toString()}%`
			: '—'
	const selfStakeLabel = selfStakeMax
		? 'MAX'
		: selfStake !== undefined
			? formatCompactNumber(selfStake.toNumber(), i18n.resolvedLanguage)
			: '—'

	return {
		rateLabel,
		selfStakeLabel,
		selfStakeMax,
		statusLabel,
		totalStake,
		validatorStatus,
	}
}

export const ValidatorSummary = (props: ValidatorSummaryProps) => {
	const { t } = useTranslation('app')
	const {
		activityTier,
		address,
		ariaLabel,
		isRatePreloading = false,
		isStatusValuePreloading = false,
		selfStake,
		statusActive,
		statusValue,
		unit,
	} = props
	const {
		rateLabel,
		selfStakeLabel,
		selfStakeMax,
		statusLabel,
		totalStake,
		validatorStatus,
	} = useValidatorSummaryData(props)

	return (
		<ListItem.Summary aria-label={ariaLabel ?? t('validatorSummary')}>
			<ListItem.Metric
				label={
					<>
						<ListItem.StatusDot
							active={statusActive ?? validatorStatus === 'active'}
							aria-hidden="true"
						/>
						<span>{statusLabel}</span>
					</>
				}
				valueProps={{
					'aria-busy': isStatusValuePreloading,
					title: statusValue
						? `${statusValue.toFormat()} ${unit}`
						: totalStake
							? `${totalStake} ${unit}`
							: undefined,
				}}
			>
				{isStatusValuePreloading ? (
					<ListItem.DetailLoader />
				) : (
					<>
						<span>{totalStake ?? '—'}</span>
						{totalStake && <small>{unit}</small>}
					</>
				)}
			</ListItem.Metric>
			<ListItem.Metric aria-busy={isRatePreloading} label="APY">
				{isRatePreloading ? <ListItem.DetailLoader /> : rateLabel}
			</ListItem.Metric>
			<ListItem.Metric
				label={t('performance')}
				valueProps={{ style: { overflow: 'hidden' } }}
			>
				<ActivityTier address={address} activityTier={activityTier} detailed />
			</ListItem.Metric>
			<ListItem.Metric label={t('selfStake')}>
				<span>{selfStakeLabel}</span>
				{selfStake !== undefined && !selfStakeMax && <small>{unit}</small>}
			</ListItem.Metric>
		</ListItem.Summary>
	)
}
