// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from 'hooks/useHelp'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useTranslation } from 'react-i18next'
import { ButtonHelp } from 'ui-buttons'
import {
	Badge,
	CardHeader,
	Separator,
	StatusCard,
	type StatusCardStatus,
} from 'ui-core/base'
import type { NominationHealthProps } from './types'
import { getValidatorsWithRetainment } from './utils'
import { NominationHealthWrapper } from './Wrapper'

export const RetainmentThresholds = {
	high: 75,
	low: 50,
} as const

const getRetainmentStatus = (rate: number): StatusCardStatus => {
	if (rate >= RetainmentThresholds.high) {
		return 'success'
	}
	if (rate >= RetainmentThresholds.low) {
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
	const validatorsWithRetainment = getValidatorsWithRetainment(
		validators,
		retainmentByAddress,
	)
	const validatorsBelowThreshold = validatorsWithRetainment
		.filter(({ rate }) => rate < RetainmentThresholds.high)
		.map(({ validator }) => validator)
	const hasDangerWarnings =
		!isLoading &&
		validatorsWithRetainment.some(({ rate }) => rate < RetainmentThresholds.low)
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
		validatorsWithRetainment.some(({ rate }) => rate < RetainmentThresholds.low)
			? 'danger'
			: 'warning'
	const status = getRetainmentStatus(averageRetainment)
	const descriptionKey = `averageRetainmentDescription${status[0].toUpperCase()}${status.slice(1)}`
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
				{t(descriptionKey)}
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
