// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { RetainmentThresholds } from 'consts/retainment'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { useValidatorWarnings } from 'hooks/useValidatorWarnings'
import {
	getValidatorsWithHealthIssues,
	getValidatorsWithRetainment,
} from 'library/GenerateNominations/utils'
import { useValidatorDetails } from 'library/ValidatorList/useValidatorDetails'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondFor } from 'types'
import { ButtonPrimary } from 'ui-buttons'
import { Page, StatusCard } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
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

export const NominationWarnings = ({
	bondFor,
	onLoadingChange,
}: {
	bondFor?: BondFor
	onLoadingChange?: (isLoading: boolean) => void
}) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { getNominations } = useBalances()
	const { openCanvas } = useOverlay().canvas
	const { formatWithPrefs } = useValidators()
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const { activePool, activePoolNominations, isNominator, isOwner } =
		useActivePool()

	// Check whether the active account can manage the pool's nominations.
	const canManagePoolNominations = isOwner() || isNominator()

	// Resolve whether to manage pool or nominator nominations.
	const effectiveBondFor: BondFor =
		bondFor ?? (canManagePoolNominations ? 'pool' : 'nominator')

	// Check whether pool nominations are being managed.
	const forPool = effectiveBondFor === 'pool'

	// Get the nominations for the resolved staking type.
	const nominations = formatWithPrefs(
		forPool
			? (activePoolNominations?.targets ?? [])
			: getNominations(activeAddress),
	)

	// Get the validator addresses needed for detail lookup.
	const validatorAddresses = nominations.map(({ address }) => address)

	// Display actionable warnings for the active account's nominations.
	const canDisplay =
		!isReadOnlyAccount(activeAddress) &&
		pluginEnabled('staking_api') &&
		Boolean(activeAddress) &&
		(!forPool || canManagePoolNominations)

	// Load retainment details for the nominated validators.
	const validatorDetails = useValidatorDetails(
		validatorAddresses,
		canDisplay && retainmentStatsEnabled && nominations.length > 0,
	)
	const { warnings, isLoading: warningsLoading } = useValidatorWarnings(
		network,
		validatorAddresses,
		canDisplay,
	)
	const isLoading = validatorDetails.isLoading || warningsLoading

	useEffect(() => {
		onLoadingChange?.(isLoading)
		return () => onLoadingChange?.(false)
	}, [isLoading, onLoadingChange])

	const { sunsettingWarnings } = getValidatorsWithHealthIssues(
		nominations,
		[],
		warnings,
	)

	// Count nominees below the retainment threshold.
	const dangerCount = retainmentStatsEnabled
		? getValidatorsWithRetainment(
				nominations,
				validatorDetails.retainmentByAddress,
			).filter(({ rate }) => rate < RetainmentThresholds.medium).length
		: 0

	// Open the nomination manager for the resolved staking type.
	const handleFix = () => {
		openCanvas({
			key: 'ManageNominations',
			options: {
				bondFor: effectiveBondFor,
				nominated: nominations,
				nominator: forPool
					? (activePool?.addresses?.stash ?? null)
					: activeAddress,
			},
			scroll: false,
			variant: 'card',
		})
	}

	if (!canDisplay || (dangerCount === 0 && sunsettingWarnings.length === 0)) {
		return null
	}

	return (
		<Page.Container style={{ flex: '0 0 auto' }}>
			{sunsettingWarnings.map(({ type, messageKey, validators }) => (
				<Page.Row key={type} yMargin="compact">
					<Page.RowSection standalone>
						<ValidatorWarning onFix={handleFix}>
							{t(messageKey, { count: validators.length })}
						</ValidatorWarning>
					</Page.RowSection>
				</Page.Row>
			))}
			{dangerCount > 0 && (
				<Page.Row yMargin="compact">
					<Page.RowSection standalone>
						<RetainmentThresholdDanger count={dangerCount} onFix={handleFix} />
					</Page.RowSection>
				</Page.Row>
			)}
		</Page.Container>
	)
}
