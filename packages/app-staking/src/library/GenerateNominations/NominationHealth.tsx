// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { RetainmentThresholds } from 'consts/retainment'
import { useHelp } from 'hooks/useHelp'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { RetainmentStatus } from 'types'
import { ButtonHelp } from 'ui-buttons'
import { Badge, CardHeader, Separator, StatusCard } from 'ui-core/base'
import { getRetainmentStatus } from 'utils'
import type { NominationHealthProps } from './types'
import { getValidatorsWithRetainment } from './utils'
import { NominationHealthWrapper } from './Wrapper'

export const NominationHealth = ({
	isLoading,
	retainmentByAddress,
	validators,
}: NominationHealthProps) => {
	const { t, i18n } = useTranslation('app')
	const { openHelpTooltip } = useHelp()
	const validatorsWithRetainment = useMemo(
		() => getValidatorsWithRetainment(validators, retainmentByAddress),
		[retainmentByAddress, validators],
	)
	// Get the validators that are below the high retainment threshold and need attention.
	const validatorsBelowThreshold = useMemo(
		() =>
			validatorsWithRetainment
				.filter(({ rate }) => rate < RetainmentThresholds.high)
				.map(({ validator }) => validator),
		[validatorsWithRetainment],
	)

	// Get the validators that are below the medium retainment threshold and need attention.
	const hasDangerWarnings =
		!isLoading &&
		validatorsWithRetainment.some(
			({ rate }) => rate < RetainmentThresholds.medium,
		)

	// Use the useNominationHealth hook to manage the nomination health state.
	useNominationHealth({
		hasDangerWarnings,
		validatorsBelowThreshold,
	})

	// If the data is still loading or there are no validators with retainment data, return null to
	// avoid rendering the component.
	if (isLoading || validatorsWithRetainment.length === 0) {
		return null
	}

	// Calculate the average retainment rate across all validators with retainment data.
	const averageRetainment =
		validatorsWithRetainment.reduce((total, { rate }) => total + rate, 0) /
		validatorsWithRetainment.length

	// Determine the status of the threshold warning based on the retainment rates of the validators.
	const thresholdWarningStatus: RetainmentStatus =
		validatorsWithRetainment.some(
			({ rate }) => rate < RetainmentThresholds.medium,
		)
			? 'danger'
			: 'warning'

	// Determine the overall retainment status based on the average retainment rate.
	const status = getRetainmentStatus(averageRetainment)

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
							margin: '0.5rem 0 0',
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
						{t('averageRetainmentScore')}:{' '}
						{`${averageRetainment.toLocaleString(i18n.resolvedLanguage, {
							maximumFractionDigits: 1,
						})}%`}
					</>
				}
			>
				{t(
					`averageRetainmentDescription${status[0].toUpperCase()}${status.slice(1)}`,
				)}
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
