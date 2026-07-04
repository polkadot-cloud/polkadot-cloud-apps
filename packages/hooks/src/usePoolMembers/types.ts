// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ServiceInterface } from 'types'

type PoolMemberQueryResult = Awaited<
	ReturnType<ServiceInterface['query']['poolMembersMulti']>
>[number]
type ClaimPermissionQueryResult = Awaited<
	ReturnType<ServiceInterface['query']['claimPermissionsMulti']>
>[number]

export type PoolMembersSync = 'synced' | 'unsynced' | 'syncing'

export interface PoolMembersHookInterface {
	fetchPoolMemberData: (addresses: string[]) => Promise<void>
	meta: FetchedPoolMembers
	fetchedPoolMembersApi: PoolMembersSync
	setFetchedPoolMembersApi: (s: PoolMembersSync) => void
	resetPoolMemberData: () => void
}

export interface FetchedPoolMembers {
	poolMembers: (FetchedPoolMember | undefined)[]
	addresses: string[]
	claimPermissions: ClaimPermissionQueryResult[]
}

export type FetchedPoolMember = NonNullable<PoolMemberQueryResult> & {
	address: string
}
