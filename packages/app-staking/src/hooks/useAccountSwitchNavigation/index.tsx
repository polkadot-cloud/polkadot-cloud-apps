// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useBalances } from 'hooks/useBalances'
import { useSyncing } from 'hooks/useSyncing'
import { useUi } from 'hooks/useUi'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const useAccountSwitchNavigation = () => {
	const navigate = useNavigate()
	const { pathname } = useLocation()
	const { advancedMode } = useUi()
	const { activeAccount } = useActiveAccount()
	const { getPoolMembership, getStakingLedger, getNominations } = useBalances()
	const { accountSynced } = useSyncing()

	// Track the previous account address to detect actual account switches
	const previousAccountRef = useRef<string | null>(null)

	useEffect(() => {
		if (!activeAccount?.address) {
			return
		}

		const address = activeAccount.address

		// Only redirect on actual account switch, not on manual navigation
		if (previousAccountRef.current === address) {
			return
		}

		// Update the previous account reference
		previousAccountRef.current = address

		// Wait for account data to be synced before making navigation decisions
		if (!accountSynced(address)) {
			return
		}

		// Helper function to check if an account is in a pool
		const isInPool = () => {
			const { membership } = getPoolMembership(address)
			return !!membership
		}

		// Helper function to check if an account is nominating (bonding + nominating)
		const isNominating = () => {
			const { ledger } = getStakingLedger(address)
			const nominations = getNominations(address)

			// Account is nominating if it has an active staking ledger and nominations
			const isBonding = (ledger?.active || 0n) > 0n
			const hasNominations = nominations.length > 0
			return isBonding && hasNominations
		}

		const accountInPool = isInPool()
		const accountNominating = isNominating()

		// In Simple mode, handle navigation between stake and pool/nominate pages
		if (!advancedMode) {
			// If on stake page and account is both in pool AND nominating, redirect to pool (since
			// separate pages would be shown for users who are both pooling and nominating)
			if (pathname === '/stake' && accountInPool && accountNominating) {
				navigate('/pool')
				return
			}

			// If on pool or nominate page (separate pages only shown when both pooling and nominating)
			// and account is no longer in that state, redirect to stake page
			if (
				(pathname === '/pool' || pathname === '/nominate') &&
				!(accountInPool && accountNominating)
			) {
				navigate('/stake')
				return
			}
		}

		// Only redirect if we're on the relevant pages and the account state is clear
		if (pathname === '/pool' && accountNominating && !accountInPool) {
			// On pool page, switching to nominating account -> go to nominate page
			navigate('/nominate')
			return
		} else if (
			pathname === '/nominate' &&
			accountInPool &&
			!accountNominating
		) {
			// On nominate page, switching to pool member account -> go to pool page
			navigate('/pool')
		}
	}, [
		activeAccount,
		pathname,
		navigate,
		accountSynced,
		advancedMode,
		getPoolMembership,
		getStakingLedger,
		getNominations,
	])
}
