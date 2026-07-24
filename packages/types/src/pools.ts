// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	PalletNominationPoolsBondedPoolInner,
	PalletNominationPoolsCommission,
} from 'dedot/chaintypes'
import type { Perbill } from 'dedot/codecs'
import type { MaybeAddress } from './accounts'

export type ClaimPermission =
	| 'Permissioned'
	| 'PermissionlessCompound'
	| 'PermissionlessWithdraw'
	| 'PermissionlessAll'

export type BondedPoolQuery = Omit<
	PalletNominationPoolsBondedPoolInner,
	'roles' | 'commission'
> & {
	roles: PoolRoles
	commission: Omit<PalletNominationPoolsCommission, 'current'> & {
		current?: [Perbill, string] | undefined
	}
}

export type BondedPool = BondedPoolQuery & {
	addresses: {
		stash: string
		reward: string
	}
	id: number
}

export interface ActivePool {
	id: number
	addresses: { stash: string; reward: string }
	bondedPool: {
		points: bigint
		memberCounter: number
		roles: {
			depositor: string
			nominator: string | undefined
			root: string | undefined
			bouncer: string | undefined
		}
		state: 'Open' | 'Blocked' | 'Destroying'
	}
	rewardPool: {
		lastRecordedRewardCounter: bigint
		lastRecordedTotalPayouts: bigint
		totalCommissionClaimed: bigint
		totalCommissionPending: bigint
		totalRewardsClaimed: bigint
	}
	rewardAccountBalance: bigint
	nominators: {
		targets: string[]
		submittedIn: number
	}
}

export type NominationStatuses = Record<string, string>

export type PoolTab = 'All' | 'Active' | 'Locked' | 'Destroying'

export type PoolState = 'Open' | 'Blocked' | 'Destroying'

export interface PoolUnlocking {
	era: number
	value: bigint
}

export type PoolRole = 'depositor' | 'nominator' | 'root' | 'bouncer'

export interface PoolRoles {
	depositor?: MaybeAddress
	nominator?: MaybeAddress
	root?: MaybeAddress
	bouncer?: MaybeAddress
}

export interface PoolMember {
	poolId: number
	who: string
}

export interface ActivePoolItem {
	id: string
	addresses: {
		stash: string
		reward: string
	}
}
