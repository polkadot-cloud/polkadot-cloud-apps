// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { RetainmentThresholds } from 'consts/retainment'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useSingletonStore } from 'hooks'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import {
	getValidatorsWithRetainment,
	getValidatorWarningGroups,
} from 'library/GenerateNominations/utils'
import { useEffect, useMemo } from 'react'
import type { BondFor } from 'types'
import { useOverlay } from 'ui-overlay'
import {
	fetchNominationWarnings,
	nominationWarningsStore,
	warningRequestKey,
} from './cache'

export const useNominationWarnings = () => {
	const { network } = useNetwork()
	const { activeEra } = useApi()
	const { erasPerDay } = useErasPerDay()
	const { getNominations } = useBalances()
	const { openCanvas } = useOverlay().canvas
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const { activePool, activePoolNominations, isNominator, isOwner } =
		useActivePool()

	// Check whether the active account can manage the pool's nominations.
	const canManagePoolNominations = isOwner() || isNominator()

	// Resolve whether to manage pool or nominator nominations.
	const effectiveBondFor: BondFor = canManagePoolNominations
		? 'pool'
		: 'nominator'

	// Check whether pool nominations are being managed.
	const forPool = effectiveBondFor === 'pool'

	// Get the nominations for the resolved staking type.
	const { formatWithPrefs } = useValidators(
		forPool
			? (activePoolNominations?.targets ?? [])
			: getNominations(activeAddress),
	)
	const nominations = formatWithPrefs(
		forPool
			? (activePoolNominations?.targets ?? [])
			: getNominations(activeAddress),
	)

	// Get the validator addresses needed for detail lookup.
	const validatorAddresses = nominations.map(({ address }) => address)

	// Read-only accounts should still see warnings on supported networks.
	const canDisplay = retainmentStatsEnabled && Boolean(activeAddress)
	const canFix = !isReadOnlyAccount(activeAddress)

	const addressesKey = JSON.stringify([...new Set(validatorAddresses)].sort())
	const request = useMemo(
		() => ({
			network,
			era: activeEra.index,
			erasPerDay,
			retainmentStatsEnabled,
			addresses: JSON.parse(addressesKey) as string[],
		}),
		[
			network,
			activeEra.index,
			erasPerDay,
			retainmentStatsEnabled,
			addressesKey,
		],
	)
	const entries = useSingletonStore(nominationWarningsStore)
	const result = entries[warningRequestKey(request)]
	const enabled = canDisplay && validatorAddresses.length > 0

	useEffect(() => {
		if (enabled) {
			void fetchNominationWarnings(request)
		}
	}, [enabled, request])

	const isLoading = enabled && (!result || result.status === 'loading')
	const validatorWarningGroups = getValidatorWarningGroups(
		nominations,
		result?.warnings ?? {},
		'danger',
	)
	const dangerCount = result?.retainmentByAddress
		? getValidatorsWithRetainment(
				nominations,
				result.retainmentByAddress,
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

	return {
		canDisplay,
		canFix,
		dangerCount,
		handleFix,
		isLoading,
		validatorWarningGroups,
	}
}
