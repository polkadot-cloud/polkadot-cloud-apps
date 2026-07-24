// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	AccountBalance,
	MaybeAddress,
	PoolMembershipState,
	StakingLedger,
} from 'types'

export interface BalancesHookInterface {
	getAccountBalance: (address: MaybeAddress) => AccountBalance
	getStakingLedger: (address: MaybeAddress) => StakingLedger
	getPoolMembership: (address: MaybeAddress) => PoolMembershipState
	getNominations: (address: MaybeAddress) => string[]
	getEdReserved: () => bigint
	getPendingPoolRewards: (address: MaybeAddress) => bigint
	feeReserve: bigint
	setFeeReserveBalance: (reserve: bigint) => void
}
