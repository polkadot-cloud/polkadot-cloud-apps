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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondFor } from 'types'
import { ButtonPrimary } from 'ui-buttons'
import { Page, StatusCard } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import classes from './index.module.scss'

const PREVIEW_DANGER_COUNT = import.meta.env.MODE === 'development' ? 1 : 0

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
	const { activeAddress } = useActiveAccount()
	const { getNominations } = useBalances()
	const { formatWithPrefs } = useValidators()
	const { activePool, activePoolNominations, isOwner } = useActivePool()
	const { openCanvas } = useOverlay().canvas
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const forPool = bondFor === 'pool' || (bondFor === undefined && isOwner())
	const effectiveBondFor = forPool ? 'pool' : 'nominator'
	const nominations = formatWithPrefs(
		forPool
			? (activePoolNominations?.targets ?? [])
			: getNominations(activeAddress),
	)
	const validatorAddresses = nominations.map(({ address }) => address)
	const canDisplay = Boolean(activeAddress) && (!forPool || isOwner())
	const validatorDetails = useValidatorDetails(
		validatorAddresses,
		retainmentStatsEnabled && canDisplay && nominations.length > 0,
	)
	const dangerCount = useMemo(
		() =>
			getValidatorsWithRetainment(
				nominations,
				validatorDetails.retainmentByAddress,
			).filter(({ rate }) => rate < RetainmentThresholds.medium).length,
		[nominations, validatorDetails.retainmentByAddress],
	)
	const previewCount =
		canDisplay && nominations.length > 0 ? PREVIEW_DANGER_COUNT : 0
	const displayedDangerCount = dangerCount || previewCount
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

	if (!canDisplay || displayedDangerCount === 0) {
		return null
	}

	return (
		<Page.Row yMargin>
			<Page.RowSection standalone>
				<RetainmentThresholdDanger
					count={displayedDangerCount}
					onFix={handleFix}
				/>
			</Page.RowSection>
		</Page.Row>
	)
}
