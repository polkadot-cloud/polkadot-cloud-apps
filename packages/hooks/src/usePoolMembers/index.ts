// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useQuery } from '@tanstack/react-query'
import { fetchPoolMembers } from 'plugin-staking-api'
import type { PoolMembers } from 'plugin-staking-api/types'
import { useNetwork } from '../useNetwork'
import type { FetchedPoolMembers } from './types'

export type { FetchedPoolMember, FetchedPoolMembers } from './types'

const normalizeMembers = (data: PoolMembers): FetchedPoolMembers => ({
	...data,
	members: data.members.map(({ points, unbondingEras, ...member }) => ({
		...member,
		points: BigInt(points),
		unbondingEras: unbondingEras.map(({ era, amount }) => [
			era,
			BigInt(amount),
		]),
	})),
})

export const usePoolMembers = (
	poolId: number,
	page: number,
	itemsPerPage: number,
) => {
	const { network } = useNetwork()
	return useQuery({
		queryKey: ['pool-members', network, poolId, page, itemsPerPage],
		queryFn: async ({ signal }) => {
			const { poolMembers } = await fetchPoolMembers(
				network,
				poolId,
				itemsPerPage,
				(page - 1) * itemsPerPage,
				signal,
			)
			return poolMembers
		},
		select: normalizeMembers,
		enabled: poolId > 0,
		retry: false,
	})
}
