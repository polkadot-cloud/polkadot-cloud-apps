// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { RetainmentThresholds } from 'consts/retainment'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { RetainmentThresholdDanger } from 'library/NominationWarnings'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { Badge, Separator, StatusCard } from 'ui-core/base'
import { getRetainmentStatus } from 'utils'
import type { NominationHealthProps } from './types'
import {
	getValidatorsWithHealthIssues,
	getValidatorsWithRetainment,
} from './utils'
import { NominationHealthWrapper } from './Wrappers'

export const NominationHealth = ({
	allValidatorsWaiting,
	isLoading,
	retainmentByAddress,
	standalone = false,
	validators,
	warnings,
}: NominationHealthProps) => {
	const { t, i18n } = useTranslation('app')
	const validatorsWithRetainment = useMemo(
		() => getValidatorsWithRetainment(validators, retainmentByAddress),
		[retainmentByAddress, validators],
	)
	const { lowRetainmentValidators, retainmentTotal, warningCount } =
		useMemo(() => {
			const lowRetainment: Validator[] = []
			let total = 0
			let warnings = 0

			for (const { rate, validator } of validatorsWithRetainment) {
				total += rate
				if (rate < RetainmentThresholds.medium) {
					lowRetainment.push(validator)
				} else if (rate < RetainmentThresholds.high) {
					warnings += 1
				}
			}

			return {
				lowRetainmentValidators: lowRetainment,
				retainmentTotal: total,
				warningCount: warnings,
			}
		}, [validatorsWithRetainment])
	const { sunsettingCount, sunsettingWarnings, validatorsWithIssues } = useMemo(
		() =>
			getValidatorsWithHealthIssues(
				validators,
				lowRetainmentValidators,
				warnings,
			),
		[validators, lowRetainmentValidators, warnings],
	)
	const dangerCount = lowRetainmentValidators.length
	const hasDangerWarnings = validatorsWithIssues.length > 0
	const hasWarnings = hasDangerWarnings || warningCount > 0

	const { setNominationHealth } = useNominationHealth()
	useEffect(() => {
		setNominationHealth({
			hasDangerWarnings,
			isLoading,
			lowRetainmentCount: dangerCount,
			sunsettingCount,
			validatorsWithIssues,
		})
		return () => {
			setNominationHealth({
				hasDangerWarnings: false,
				isLoading: false,
				lowRetainmentCount: 0,
				sunsettingCount: 0,
				validatorsWithIssues: [],
			})
		}
	}, [
		dangerCount,
		hasDangerWarnings,
		isLoading,
		sunsettingCount,
		validatorsWithIssues,
		setNominationHealth,
	])

	// Keep displaying cached results while additional validator details load.
	if (
		validatorsWithRetainment.length === 0 &&
		!allValidatorsWaiting &&
		!hasDangerWarnings
	) {
		return null
	}

	// Calculate the average retainment rate across all validators with retainment data.
	const averageRetainment = validatorsWithRetainment.length
		? retainmentTotal / validatorsWithRetainment.length
		: null

	// Determine the overall retainment status based on the average retainment rate.
	const status =
		averageRetainment === null ? null : getRetainmentStatus(averageRetainment)

	return (
		<NominationHealthWrapper $standalone={standalone}>
			{(hasWarnings || allValidatorsWaiting) && (
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
			{sunsettingWarnings.map(({ type, messageKey, validators }) => (
				<StatusCard key={type} status="danger" role="status">
					{t(messageKey, { count: validators.length })}
				</StatusCard>
			))}
			{averageRetainment !== null && status !== null && (
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
			)}
			{allValidatorsWaiting && (
				<StatusCard status="warning" role="status">
					{t('noActiveValidatorsWarning')}
				</StatusCard>
			)}
			{warningCount > 0 && (
				<StatusCard status="warning" role="status">
					{t('retainmentThresholdWarning', {
						count: warningCount,
						threshold: RetainmentThresholds.high,
					})}
				</StatusCard>
			)}
			<RetainmentThresholdDanger count={dangerCount} />
		</NominationHealthWrapper>
	)
}
