// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleCheck,
	faCircleXmark,
} from '@fortawesome/free-regular-svg-icons'
import { faExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { clampRate } from 'library/ValidatorList/retainment'
import type { ValidatorRetainmentResult } from 'plugin-staking-api/types'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { ButtonSecondary } from 'ui-buttons'
import {
	RetainmentSummaryHeading,
	RetainmentSummaryWrapper,
	StatusBox,
	StatusCopy,
	StatusMessage,
	WarningCopy,
} from './RetainmentSummary.styles'

const HIGH_RETAINMENT_THRESHOLD = 75
const LOW_RETAINMENT_THRESHOLD = 50
const SHOW_ALL_VARIATIONS = true

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

interface RetainmentSummaryProps {
	isLoading: boolean
	onRemove: (validators: Validator[]) => void
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

export const RetainmentSummary = ({
	isLoading,
	onRemove,
	retainmentByAddress,
	validators,
}: RetainmentSummaryProps) => {
	const { t, i18n } = useTranslation('app')

	// Temporary preview for comparing every retainment warning state.
	if (SHOW_ALL_VARIATIONS) {
		const previewScores: Array<{
			status: RetainmentStatus
			value: string
		}> = [
			{ status: 'success', value: '85%' },
			{ status: 'warning', value: '60%' },
			{ status: 'danger', value: '35%' },
		]

		return (
			<RetainmentSummaryWrapper>
				<RetainmentSummaryHeading>
					{t('nominationHealthCheck')}
				</RetainmentSummaryHeading>
				{previewScores.map(({ status, value }) => (
					<StatusBox $status={status} key={status}>
						<StatusMessage $status={status}>
							<StatusIcon status={status} />
							<StatusCopy $status={status}>
								<strong>
									{t('averageRetainmentScore')}: {value}
								</strong>
								<span>{t(descriptionKeys[status])}</span>
							</StatusCopy>
						</StatusMessage>
					</StatusBox>
				))}
				<StatusBox $status="danger" role="status">
					<WarningCopy>
						<FontAwesomeIcon icon={faCircleXmark} />
						<span>{t('lowRetainmentValidatorsWarning', { count: 2 })}</span>
					</WarningCopy>
					<ButtonSecondary asLabel text={t('remove')} variant="danger" />
				</StatusBox>
			</RetainmentSummaryWrapper>
		)
	}

	const validatorsWithRetainment = validators.flatMap((validator) => {
		const rate = retainmentByAddress.get(validator.address)?.months[0]
			?.retainmentRate
		return typeof rate === 'number' && Number.isFinite(rate)
			? [{ rate: clampRate(rate), validator }]
			: []
	})

	if (isLoading || validatorsWithRetainment.length === 0) {
		return null
	}

	const averageRetainment =
		validatorsWithRetainment.reduce((total, { rate }) => total + rate, 0) /
		validatorsWithRetainment.length
	const lowRetainmentValidators = validatorsWithRetainment
		.filter(({ rate }) => rate < LOW_RETAINMENT_THRESHOLD)
		.map(({ validator }) => validator)
	const status = getRetainmentStatus(averageRetainment)
	const averageRetainmentLabel = `${averageRetainment.toLocaleString(
		i18n.resolvedLanguage,
		{ maximumFractionDigits: 1 },
	)}%`

	return (
		<RetainmentSummaryWrapper>
			<RetainmentSummaryHeading>
				{t('nominationHealthCheck')}
			</RetainmentSummaryHeading>
			<StatusBox $status={status}>
				<StatusMessage $status={status}>
					<StatusIcon status={status} />
					<StatusCopy $status={status}>
						<strong>
							{t('averageRetainmentScore')}: {averageRetainmentLabel}
						</strong>
						<span>{t(descriptionKeys[status])}</span>
					</StatusCopy>
				</StatusMessage>
			</StatusBox>
			{lowRetainmentValidators.length > 0 && (
				<StatusBox $status="danger" role="status">
					<WarningCopy>
						<FontAwesomeIcon icon={faCircleXmark} />
						<span>
							{t('lowRetainmentValidatorsWarning', {
								count: lowRetainmentValidators.length,
							})}
						</span>
					</WarningCopy>
					<ButtonSecondary
						text={t('remove')}
						variant="danger"
						onClick={() => onRemove(lowRetainmentValidators)}
					/>
				</StatusBox>
			)}
		</RetainmentSummaryWrapper>
	)
}
