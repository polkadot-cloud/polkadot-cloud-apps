// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleCheck,
	faCircleXmark,
} from '@fortawesome/free-regular-svg-icons'
import { faExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHelp } from 'hooks/useHelp'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { clampRate } from 'library/ValidatorList/retainment'
import type { ValidatorRetainmentResult } from 'plugin-staking-api/types'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { ButtonHelp } from 'ui-buttons'
import {
	HealthCheckFixCopy,
	HealthCheckFixPrompt,
	NominationHealthHeader,
	NominationHealthHeading,
	NominationHealthWrapper,
	StatusBox,
	StatusCopy,
	StatusIconWrapper,
	StatusMessage,
	WarningCopy,
} from './NominationHealth.styles'

const HIGH_RETAINMENT_THRESHOLD = 75
const LOW_RETAINMENT_THRESHOLD = 50

type RetainmentStatus = 'success' | 'warning' | 'danger'

const descriptionKeys: Record<RetainmentStatus, string> = {
	danger: 'averageRetainmentDescriptionDanger',
	success: 'averageRetainmentDescriptionSuccess',
	warning: 'averageRetainmentDescriptionWarning',
}

const StatusIcon = ({ status }: { status: RetainmentStatus }) =>
	status === 'warning' ? (
		<span className="warningIcon">
			<FontAwesomeIcon icon={faExclamation} />
		</span>
	) : (
		<FontAwesomeIcon
			icon={status === 'success' ? faCircleCheck : faCircleXmark}
		/>
	)

interface NominationHealthProps {
	isLoading: boolean
	onFix: (validators: Validator[]) => Promise<void>
	retainmentByAddress: ReadonlyMap<string, ValidatorRetainmentResult | null>
	validators: Validator[]
}

const getRetainmentStatus = (rate: number): RetainmentStatus => {
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
	const healthCheckHeading = (
		<NominationHealthHeading>
			{t('nominationHealthCheck')}
			<ButtonHelp
				marginLeft
				background="secondary"
				definition="Nomination Health Check"
				openHelp={openHelpTooltip}
			/>
		</NominationHealthHeading>
	)
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
	const thresholdWarningStatus: RetainmentStatus =
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
			<NominationHealthHeader>{healthCheckHeading}</NominationHealthHeader>
			{validatorsBelowThreshold.length > 0 && (
				<HealthCheckFixPrompt role="status">
					<HealthCheckFixCopy>
						{t('nominationHealthCheckNeedsAttention')}
					</HealthCheckFixCopy>
				</HealthCheckFixPrompt>
			)}
			<StatusBox $status={status}>
				<StatusMessage>
					<StatusIconWrapper $status={status}>
						<StatusIcon status={status} />
					</StatusIconWrapper>
					<StatusCopy $status={status}>
						<strong>
							{t('averageRetainmentScore')}: {averageRetainmentLabel}
						</strong>
						<span>{t(descriptionKeys[status])}</span>
					</StatusCopy>
				</StatusMessage>
			</StatusBox>
			{validatorsBelowThreshold.length > 0 && (
				<StatusBox $status={thresholdWarningStatus} role="status">
					<WarningCopy $status={thresholdWarningStatus}>
						<StatusIconWrapper $status={thresholdWarningStatus}>
							<StatusIcon status={thresholdWarningStatus} />
						</StatusIconWrapper>
						<span>
							{t('retainmentThresholdWarning', {
								count: validatorsBelowThreshold.length,
							})}
						</span>
					</WarningCopy>
				</StatusBox>
			)}
		</NominationHealthWrapper>
	)
}
