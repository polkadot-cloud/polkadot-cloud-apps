// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useSyncing } from 'hooks/useSyncing'
import type { UsePoolBondActions } from './types'

export const usePoolBondActions = (): UsePoolBondActions => {
	const { syncing } = useSyncing([
		'initialization',
		'era-stakers',
		'active-pools',
	])
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()
	const { balances } = useAccountBalances(activeAddress)
	const { isBonding, isMember, isDepositor, activePool } = useActivePool()

	// Determine bond disabled status
	const bondDisabled =
		syncing ||
		!isBonding ||
		!isMember() ||
		isReadOnlyAccount(activeAddress) ||
		activePool?.bondedPool.state === 'Destroying'

	// Determine if user can leave the pool
	const canLeavePool = isMember() && !isDepositor() && balances.pool.active > 0n

	return {
		canLeavePool,
		bondDisabled,
	}
}
