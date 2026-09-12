// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useNominationWarnings } from 'hooks/useNominationWarnings'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'ui-buttons'
import { Page, StatusCard } from 'ui-core/base'
import classes from './index.module.scss'

const ValidatorWarning = ({
	children,
	onFix,
}: {
	children: ReactNode
	onFix?: () => void
}) => {
	const { t } = useTranslation('app')

	return (
		<StatusCard
			action={
				onFix ? (
					<ButtonPrimary
						className={classes.fixButton}
						onClick={onFix}
						text={t('fixIssues')}
					/>
				) : undefined
			}
			icon={faCircleExclamation}
			iconFrame={false}
			status="danger"
			role="status"
		>
			{children}
		</StatusCard>
	)
}

export const RetainmentThresholdDanger = ({
	count,
	onFix,
}: {
	count: number
	onFix?: () => void
}) => {
	const { t } = useTranslation('app')

	return count > 0 ? (
		<ValidatorWarning onFix={onFix}>
			{t('retainmentThresholdDanger', { count })}
		</ValidatorWarning>
	) : null
}

export const NominationWarnings = () => {
	const { t } = useTranslation('app')
	const {
		canDisplay,
		canFix,
		dangerCount,
		handleFix,
		hasWarnings,
		isPoolMember,
		validatorWarningGroups,
	} = useNominationWarnings()

	if (canDisplay && isPoolMember) {
		return hasWarnings ? (
			<Page.Row yMargin="compact">
				<Page.RowSection standalone>
					<StatusCard
						icon={faCircleExclamation}
						iconFrame={false}
						status={
							dangerCount > 0 || validatorWarningGroups.length > 0
								? 'danger'
								: 'warning'
						}
						role="status"
					>
						{t('poolNominationWarnings')}
					</StatusCard>
				</Page.RowSection>
			</Page.Row>
		) : null
	}

	if (
		!canDisplay ||
		(dangerCount === 0 && validatorWarningGroups.length === 0)
	) {
		return null
	}

	return (
		<>
			{validatorWarningGroups.map(({ type, messageKey, validators }) => (
				<Page.Row key={type} yMargin="compact">
					<Page.RowSection standalone>
						<ValidatorWarning onFix={canFix ? handleFix : undefined}>
							{t(messageKey, { count: validators.length })}
						</ValidatorWarning>
					</Page.RowSection>
				</Page.Row>
			))}
			{dangerCount > 0 && (
				<Page.Row yMargin="compact">
					<Page.RowSection standalone>
						<RetainmentThresholdDanger
							count={dangerCount}
							onFix={canFix ? handleFix : undefined}
						/>
					</Page.RowSection>
				</Page.Row>
			)}
		</>
	)
}
