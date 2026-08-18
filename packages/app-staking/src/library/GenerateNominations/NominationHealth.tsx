// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { RetainmentThresholds } from 'consts/retainment'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, Separator, StatusCard } from 'ui-core/base'
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

	// Count the number of validators that fall into the warning category based on their retainment.
	const warningCount = validatorsWithRetainment.filter(
		({ rate }) =>
			rate >= RetainmentThresholds.medium && rate < RetainmentThresholds.high,
	).length

	// Count the number of validators that fall into the danger category based on their retainment.
	const dangerCount = validatorsWithRetainment.filter(
		({ rate }) => rate < RetainmentThresholds.medium,
	).length

	// Get the validators that are below the medium retainment threshold and need attention.
	const hasDangerWarnings = !isLoading && dangerCount > 0

	const { setNominationHealth } = useNominationHealth()
	useEffect(() => {
		setNominationHealth({ hasDangerWarnings, validatorsBelowThreshold })
		return () => {
			setNominationHealth({
				hasDangerWarnings: false,
				validatorsBelowThreshold: [],
			})
		}
	}, [hasDangerWarnings, setNominationHealth, validatorsBelowThreshold])

	// If the data is still loading or there are no validators with retainment data, return null to
	// avoid rendering the component.
	if (isLoading || validatorsWithRetainment.length === 0) {
		return null
	}

	// Calculate the average retainment rate across all validators with retainment data.
	const averageRetainment =
		validatorsWithRetainment.reduce((total, { rate }) => total + rate, 0) /
		validatorsWithRetainment.length

	// Determine the overall retainment status based on the average retainment rate.
	const status = getRetainmentStatus(averageRetainment)

	return (
		<NominationHealthWrapper>
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
			{warningCount > 0 && (
				<StatusCard status="warning" role="status">
					{t('retainmentThresholdWarning', {
						count: warningCount,
					})}
				</StatusCard>
			)}
			{dangerCount > 0 && (
				<StatusCard status="danger" role="status">
					{t('retainmentThresholdDanger', {
						count: dangerCount,
					})}
				</StatusCard>
			)}
		</NominationHealthWrapper>
	)
}
