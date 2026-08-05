// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useValidators as useValidatorEntries } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { useTranslation } from 'react-i18next'
import type { ValidatorStatus } from 'types'
import { planckToUnitBn } from 'utils'
import {
	SummaryItem,
	SummaryLabel,
	SummaryRow,
	SummaryStatusDot,
	SummaryUnit,
	SummaryValue,
} from './Wrappers'

interface ValidatorSummaryProps {
	address: string
	rate?: number
	selfStake?: BigNumber
	status: ValidatorStatus
	unit: string
}

export const useValidatorSummaryData = ({
	address,
	rate,
	selfStake,
	status,
}: ValidatorSummaryProps) => {
	const { t, i18n } = useTranslation('app')
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { getValidatorRankSegment, getValidatorTotalStake } =
		useValidatorEntries()
	const { units } = getStakingChainData(network)

	const validatorStatus = syncing ? 'waiting' : status
	const statusLabel = syncing
		? t('syncing')
		: validatorStatus === 'waiting'
			? capitalizeFirstLetter(t(validatorStatus) ?? '')
			: t('listItemActive')
	const totalStake =
		!syncing && validatorStatus !== 'waiting'
			? planckToUnitBn(new BigNumber(getValidatorTotalStake(address)), units)
					.integerValue()
					.toFormat()
			: undefined

	const quartile = getValidatorRankSegment(address)
	const quartileLabel = ![100, undefined].includes(quartile)
		? `${t('top')} ${quartile}%`
		: '—'
	const rateLabel =
		typeof rate === 'number' && Number.isFinite(rate)
			? `${new BigNumber(rate).decimalPlaces(2).toString()}%`
			: '—'
	const selfStakeLabel =
		selfStake !== undefined
			? selfStake.toNumber().toLocaleString(i18n.resolvedLanguage, {
					notation: 'compact',
					maximumFractionDigits: 1,
				})
			: '—'

	return {
		quartileLabel,
		rateLabel,
		selfStakeLabel,
		statusLabel,
		totalStake,
		validatorStatus,
	}
}

export const ValidatorSummary = (props: ValidatorSummaryProps) => {
	const { t } = useTranslation('app')
	const { selfStake, unit } = props
	const {
		quartileLabel,
		rateLabel,
		selfStakeLabel,
		statusLabel,
		totalStake,
		validatorStatus,
	} = useValidatorSummaryData(props)

	return (
		<SummaryRow
			className="row summary"
			aria-label={t('validatorSummary', {
				defaultValue: 'Validator summary',
			})}
		>
			<SummaryItem>
				<SummaryLabel>
					<SummaryStatusDot
						$active={validatorStatus === 'active'}
						aria-hidden="true"
					/>
					<span>{statusLabel}</span>
				</SummaryLabel>
				<SummaryValue title={totalStake ? `${totalStake} ${unit}` : undefined}>
					<span>{totalStake ?? '—'}</span>
					{totalStake && <SummaryUnit>{unit}</SummaryUnit>}
				</SummaryValue>
			</SummaryItem>
			<SummaryItem>
				<SummaryLabel>APY</SummaryLabel>
				<SummaryValue>{rateLabel}</SummaryValue>
			</SummaryItem>
			<SummaryItem>
				<SummaryLabel>{t('performance')}</SummaryLabel>
				<SummaryValue>{quartileLabel}</SummaryValue>
			</SummaryItem>
			<SummaryItem>
				<SummaryLabel>
					{t('selfStake', { defaultValue: 'Self stake' })}
				</SummaryLabel>
				<SummaryValue>
					<span>{selfStakeLabel}</span>
					{selfStake !== undefined && <SummaryUnit>{unit}</SummaryUnit>}
				</SummaryValue>
			</SummaryItem>
		</SummaryRow>
	)
}
