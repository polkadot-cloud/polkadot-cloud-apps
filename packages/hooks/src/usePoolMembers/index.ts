// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback } from 'react'
import { useApi } from '../useApi'
import { createSingletonStore, useSingletonStore } from '../util'
import { defaultPoolMemberData } from './defaults'
import type {
	FetchedPoolMembers,
	PoolMembersHookInterface,
	PoolMembersSync,
} from './types'

export { defaultPoolMemberData } from './defaults'
export type {
	FetchedPoolMember,
	FetchedPoolMembers,
	PoolMembersHookInterface,
	PoolMembersSync,
} from './types'

type PoolMembersState = {
	meta: FetchedPoolMembers
	fetchedPoolMembersApi: PoolMembersSync
}

const defaultPoolMembersState: PoolMembersState = {
	meta: defaultPoolMemberData,
	fetchedPoolMembersApi: 'unsynced',
}

const poolMembersStore = createSingletonStore<PoolMembersState>(
	defaultPoolMembersState,
)

const setFetchedPoolMembersApi = (status: PoolMembersSync) => {
	poolMembersStore.patchSnapshot({ fetchedPoolMembersApi: status })
}

const resetPoolMemberData = () => {
	poolMembersStore.resetSnapshot()
}

export const usePoolMembers = (): PoolMembersHookInterface => {
	const { isReady, serviceApi } = useApi()
	const { meta, fetchedPoolMembersApi } = useSingletonStore(poolMembersStore)

	const fetchPoolMemberData = useCallback(
		async (addresses: string[]) => {
			if (!isReady) {
				return
			}
			poolMembersStore.patchSnapshot({ meta: defaultPoolMemberData })

			if (!addresses.length) {
				return
			}
			const [poolMembers, claimPermissions] = await Promise.all([
				serviceApi.query.poolMembersMulti(addresses),
				serviceApi.query.claimPermissionsMulti(addresses),
			])

			poolMembersStore.patchSnapshot({
				meta: {
					addresses,
					poolMembers: poolMembers.map((member, i) => {
						if (!member) {
							return undefined
						}
						return {
							...member,
							address: addresses[i],
						}
					}),
					claimPermissions,
				},
			})
		},
		[isReady, serviceApi],
	)

	return {
		fetchPoolMemberData,
		fetchedPoolMembersApi,
		meta,
		resetPoolMemberData,
		setFetchedPoolMembersApi,
	}
}
