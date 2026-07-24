// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useApi } from 'hooks/useApi'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import type { UseNominatorBondActions } from './types'

export const useNominatorBondActions = (): UseNominatorBondActions => {
	const { isReady } = useApi()
	const { isBonding } = useStaking()
	const { activeAddress } = useActiveAccount()
	const { syncing, accountSynced } = useSyncing([
		'initialization',
		'era-stakers',
	])
	const { isReadOnlyAccount } = useImportedAccounts()

	const isReadOnly = isReadOnlyAccount(activeAddress)
	const isAccountSynced = accountSynced(activeAddress)
	const isLoading = !isReady || syncing || !isAccountSynced

	// Basic requirements: account must exist, not be read-only, not be syncing, and must already be
	// actively bonding (e.g. nominator setup complete).
	const basicRequirements =
		activeAddress && !isReadOnly && !isLoading && isBonding

	// Bond actions require basic requirements and bonding capability
	const canBond = Boolean(basicRequirements)

	// Unbond actions require basic requirements and active bonding
	const canUnbond = Boolean(basicRequirements)

	// Unstake actions require basic requirements and active bonding
	const canUnstake = Boolean(basicRequirements)

	// Whether bond is disabled
	const bondDisabled = !canBond && !canUnbond

	return {
		canBond,
		canUnbond,
		canUnstake,
		bondDisabled,
	}
}
