// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { createSafeContext } from '@w3ux/hooks'
import { useBalances } from 'hooks/useBalances'
import type { StakingHookInterface } from 'hooks/useStaking'
import type { ReactNode } from 'react'

export const [StakingContext, useStaking] =
	createSafeContext<StakingHookInterface>()

export const StakingProvider = ({ children }: { children: ReactNode }) => {
	const { activeAddress } = useActiveAccount()
	const { getStakingLedger, getNominations } = useBalances()
	const nominations = getNominations(activeAddress)

	// Helper function to determine whether the active account is bonding, or is yet to start
	const isBonding = (getStakingLedger(activeAddress).ledger?.active || 0n) > 0n

	// Helper function to determine whether the active account is nominating, or is yet to start
	const isNominating = nominations.length > 0

	// Helper function to determine whether the active account is a nominator
	const isNominator = activeAddress !== null && isBonding && isNominating

	return (
		<StakingContext.Provider
			value={{
				isBonding,
				isNominating,
				isNominator,
			}}
		>
			{children}
		</StakingContext.Provider>
	)
}
