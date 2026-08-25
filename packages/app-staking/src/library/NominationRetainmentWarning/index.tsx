// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { RetainmentThresholds } from 'consts/retainment'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { getValidatorsWithRetainment } from 'library/GenerateNominations/utils'
import { useValidatorDetails } from 'library/ValidatorList/useValidatorDetails'
import { useTranslation } from 'react-i18next'
import type { BondFor } from 'types'
import { ButtonPrimary } from 'ui-buttons'
import { Page, StatusCard } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import classes from './index.module.scss'

export const RetainmentThresholdDanger = ({
	count,
	onFix,
}: {
	count: number
	onFix?: () => void
}) => {
	const { t } = useTranslation('app')

	if (count === 0) {
		return null
	}

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
			status="danger"
			role="status"
		>
			{t('retainmentThresholdDanger', { count })}
		</StatusCard>
	)
}

export const NominationRetainmentWarning = ({
	bondFor,
}: {
	bondFor?: BondFor
}) => {
	const { getNominations } = useBalances()
	const { openCanvas } = useOverlay().canvas
	const { formatWithPrefs } = useValidators()
	const { activeAddress } = useActiveAccount()
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const { activePool, activePoolNominations, isOwner } = useActivePool()

	// Check whether the active account owns the pool.
	const poolOwner = isOwner()

	// Resolve whether to manage pool or nominator nominations.
	const effectiveBondFor: BondFor =
		bondFor ?? (poolOwner ? 'pool' : 'nominator')

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

	// Only display warnings when retainment data is available.
	const canDisplay =
		retainmentStatsEnabled && Boolean(activeAddress) && (!forPool || poolOwner)

	// Load retainment details for the nominated validators.
	const validatorDetails = useValidatorDetails(
		validatorAddresses,
		canDisplay && nominations.length > 0,
	)

	// Count nominees below the retainment threshold.
	const dangerCount = getValidatorsWithRetainment(
		nominations,
		validatorDetails.retainmentByAddress,
	).filter(({ rate }) => rate < RetainmentThresholds.medium).length

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

	if (!canDisplay || dangerCount === 0) {
		return null
	}

	return (
		<Page.Row yMargin>
			<Page.RowSection standalone>
				<RetainmentThresholdDanger count={dangerCount} onFix={handleFix} />
			</Page.RowSection>
		</Page.Row>
	)
}
