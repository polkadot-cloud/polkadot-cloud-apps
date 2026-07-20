// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface AccountBalance {
	synced: boolean
	nonce: number
	balance: {
		free: bigint
		reserved: bigint
		frozen: bigint
	}
}

export interface NominatorBalances {
	active: bigint
	totalUnlocking: bigint
	totalUnlocked: bigint
	totalPossibleBond: bigint
	totalAdditionalBond: bigint
	totalUnlockChunks: number
}

export interface PoolBalances {
	active: bigint
	totalUnlocking: bigint
	totalUnlocked: bigint
	totalPossibleBond: bigint
	totalUnlockChunks: number
}

// Interface for comprehensive balance calculations
export interface AccountBalances {
	freeBalance: bigint
	transferableBalance: bigint
	balanceTxFees: bigint
	edReserved: bigint
	totalBalance: bigint
	lockedBalance: bigint
	nominator: NominatorBalances
	pool: PoolBalances
}
