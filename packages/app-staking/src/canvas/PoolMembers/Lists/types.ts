// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PalletNominationPoolsClaimPermission } from 'dedot/chaintypes'
import type { FetchedPoolMember } from 'hooks/usePoolMembers'
import type { BondedPool } from 'types'

export interface MembersListProps {
	bondedPool: BondedPool
	pagination: boolean
	itemsPerPage: number
	memberCount: number
	isDepositor: boolean
	isRoot: boolean
	isOwner: boolean
	isBouncer: boolean
}

export interface MemberProps {
	member: Member
	bondedPool: BondedPool
	isDepositor: boolean
	isRoot: boolean
	isOwner: boolean
	isBouncer: boolean
}

export type Member = FetchedPoolMember & {
	claimPermission: PalletNominationPoolsClaimPermission | undefined
}
