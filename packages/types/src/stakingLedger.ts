// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PalletNominationPoolsClaimPermission } from 'dedot/chaintypes'
import type { RewardDestinaton } from './staking'

export interface Bonded {
	stash: string
	bonded: string
}

export interface PoolMembershipState {
	synced: boolean
	membership: PoolMembership | undefined
}
export interface StakingLedger {
	ledger: Ledger | undefined
	payee: Payee | undefined
	nominators: Nominators | undefined
	controllerUnmigrated: boolean
}

interface Ledger {
	stash: string
	total: bigint
	active: bigint
	unlocking: {
		value: bigint
		era: number
	}[]
}

interface Payee {
	destination: RewardDestinaton
	account: string | undefined
}

interface Nominators {
	targets: string[]
	submittedIn: number
}

export interface PoolMembership {
	address: string
	poolId: number
	points: bigint
	balance: bigint
	lastRecordedRewardCounter: bigint
	unbondingEras: [number, bigint][]
	claimPermission: PalletNominationPoolsClaimPermission
	pendingRewards: bigint
}
