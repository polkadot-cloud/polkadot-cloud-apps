// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from 'hooks/useHelp'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { clampRate } from 'library/ValidatorList/retainment'
import type { ValidatorRetainmentResult } from 'plugin-staking-api/types'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { ButtonHelp } from 'ui-buttons'
import {
	Badge,
	CardHeader,
	Separator,
	StatusCard,
	type StatusCardStatus,
} from 'ui-core/base'
import { NominationHealthWrapper } from './Wrapper'

const HIGH_RETAINMENT_THRESHOLD = 75
const LOW_RETAINMENT_THRESHOLD = 50

const descriptionKeys: Record<StatusCardStatus, string> = {
	danger: 'averageRetainmentDescriptionDanger',
	success: 'averageRetainmentDescriptionSuccess',
	warning: 'averageRetainmentDescriptionWarning',
}

interface NominationHealthProps {
	isLoading: boolean
	onFix: (validators: Validator[]) => Promise<void>
	retainmentByAddress: ReadonlyMap<string, ValidatorRetainmentResult | null>
	validators: Validator[]
}

const getRetainmentStatus = (rate: number): StatusCardStatus => {
	if (rate >= HIGH_RETAINMENT_THRESHOLD) {
		return 'success'
	}
	if (rate >= LOW_RETAINMENT_THRESHOLD) {
		return 'warning'
	}
	return 'danger'
}

export const NominationHealth = ({
	isLoading,
	onFix,
	retainmentByAddress,
	validators,
}: NominationHealthProps) => {
	const { t, i18n } = useTranslation('app')
	const { openHelpTooltip } = useHelp()
	const validatorsWithRetainment = validators.flatMap((validator) => {
		const rate = retainmentByAddress.get(validator.address)?.months[0]
			?.retainmentRate
		return typeof rate === 'number' && Number.isFinite(rate)
			? [{ rate: clampRate(rate), validator }]
			: []
	})
	const validatorsBelowThreshold = validatorsWithRetainment
		.filter(({ rate }) => rate < HIGH_RETAINMENT_THRESHOLD)
		.map(({ validator }) => validator)
	const hasDangerWarnings =
		!isLoading &&
		validatorsWithRetainment.some(({ rate }) => rate < LOW_RETAINMENT_THRESHOLD)
	useNominationHealth({
		hasDangerWarnings,
		onFix,
		validatorsToFix: validatorsBelowThreshold,
	})

	if (isLoading || validatorsWithRetainment.length === 0) {
		return null
	}

	const averageRetainment =
		validatorsWithRetainment.reduce((total, { rate }) => total + rate, 0) /
		validatorsWithRetainment.length
	const thresholdWarningStatus: StatusCardStatus =
		validatorsWithRetainment.some(({ rate }) => rate < LOW_RETAINMENT_THRESHOLD)
			? 'danger'
			: 'warning'
	const status = getRetainmentStatus(averageRetainment)
	const averageRetainmentLabel = `${averageRetainment.toLocaleString(
		i18n.resolvedLanguage,
		{ maximumFractionDigits: 1 },
	)}%`

	return (
		<NominationHealthWrapper>
			<CardHeader action>
				<h3>
					{t('nominationHealthCheck')}
					<ButtonHelp
						marginLeft
						background="secondary"
						definition="Nomination Health Check"
						openHelp={openHelpTooltip}
					/>
				</h3>
			</CardHeader>
			{validatorsBelowThreshold.length > 0 && (
				<div role="status">
					<Separator
						style={{
							margin: '-0.4rem 0 0',
							padding: '0 0.15rem 0.5rem',
						}}
					>
						<Badge.Inner variant="primary">
							{t('nominationHealthCheckNeedsAttention')}
						</Badge.Inner>
					</Separator>
				</div>
			)}
			<StatusCard
				status={status}
				title={
					<>
						{t('averageRetainmentScore')}: {averageRetainmentLabel}
					</>
				}
			>
				{t(descriptionKeys[status])}
			</StatusCard>
			{validatorsBelowThreshold.length > 0 && (
				<StatusCard status={thresholdWarningStatus} role="status">
					{t('retainmentThresholdWarning', {
						count: validatorsBelowThreshold.length,
					})}
				</StatusCard>
			)}
		</NominationHealthWrapper>
	)
}
