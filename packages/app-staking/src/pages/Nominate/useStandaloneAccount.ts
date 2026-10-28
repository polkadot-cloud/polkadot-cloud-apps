// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useActivePool } from 'hooks/useActivePool'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useValidators } from 'hooks/useValidators'

export const useStandaloneAccount = () => {
	const { activeAddress } = useActiveAccount()
	const { accountsInitialised } = useImportedAccounts()
	const { activePool, activePoolNominations, isOwner } = useActivePool()
	const { isBonding, isNominator } = useStaking()
	const { isLoading, isValidator } = useValidators()
	const {
		accountSynced,
		activePoolSynced,
		syncing: eligibilitySyncing,
	} = useSyncing(['initialization', 'staking-ledgers'])

	const isPool = isOwner()
	const accountIsValidator = isValidator(activeAddress)
	const eligibilityLoading = Boolean(
		activeAddress &&
			(!accountSynced(activeAddress) ||
				!activePoolSynced(activeAddress) ||
				eligibilitySyncing ||
				isLoading(activeAddress)),
	)

	return {
		activeAddress,
		accountsInitialised,
		activePool,
		activePoolNominations,
		isPool,
		accountIsValidator,
		activelyNominating: !isPool && isNominator,
		canManageNominations:
			Boolean(activeAddress) && (isPool || (isBonding && !accountIsValidator)),
		eligibilityLoading,
	}
}
