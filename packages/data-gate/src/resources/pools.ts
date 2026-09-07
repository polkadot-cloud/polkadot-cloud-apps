// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	POOL_CANDIDATES_QUERY,
	POOL_MEMBERS_QUERY,
	POOL_WARNINGS_QUERY,
} from 'plugin-staking-api'
import type {
	PoolCandidatesData,
	PoolMembersData,
	PoolWarningsData,
} from 'plugin-staking-api/types'
import type { NominationStatus, ServiceInterface } from 'types'
import { apiResource } from '../sources/apiResource'
import { mapInBatches } from '../sources/node'
import { queryStakingApi } from '../sources/stakingApi'
import type { ResourceDefinition } from '../types'
import { nominationStatuses } from './nominations'

export const poolStatuses = (
	pools: { who: string; targets: string[] }[],
	enabled = true,
): ResourceDefinition<Record<string, Record<string, NominationStatus>>> => ({
	name: 'nominationStatuses',
	key: ['pools', pools],
	refreshIntervalMs: { 'staking-api': 60_000 },
	requires: ['era'],
	enabled: enabled && pools.length > 0,
	load: async ({ request }) =>
		Object.fromEntries(
			await mapInBatches(pools, async ({ who, targets }) => [
				who,
				await request(nominationStatuses(who, targets)),
			]),
		),
})

export const poolDirectory = (): ResourceDefinition<{
	entries: Awaited<ReturnType<ServiceInterface['query']['bondedPoolEntries']>>
	metadata: Awaited<ReturnType<ServiceInterface['query']['poolMetadataMulti']>>
}> => ({
	name: 'poolDirectory',
	key: [],
	load: async ({ node }) => {
		const entries = await node.query.bondedPoolEntries()
		const metadata = await node.query.poolMetadataMulti(
			entries.map(([id]) => id),
		)
		return { entries, metadata }
	},
})

export const poolNominations = (
	addresses: string[],
): ResourceDefinition<
	Awaited<ReturnType<ServiceInterface['query']['nominatorsMulti']>>
> => ({
	name: 'poolNominations',
	key: [addresses],
	enabled: addresses.length > 0,
	load: ({ node }) => node.query.nominatorsMulti(addresses),
})

export const poolWarnings = (
	addresses: string[],
): ResourceDefinition<PoolWarningsData['poolWarnings']> => ({
	name: 'poolWarnings',
	key: [[...new Set(addresses)].sort()],
	enabled: addresses.length > 0,
	load: async ({ network, signal }) =>
		(
			await queryStakingApi<PoolWarningsData>(
				POOL_WARNINGS_QUERY,
				{ network, addresses },
				signal,
			)
		).poolWarnings,
})

export const poolMembers = (poolId: number, limit?: number, offset?: number) =>
	apiResource<PoolMembersData>(
		'poolMembers',
		'list',
		POOL_MEMBERS_QUERY,
		{ poolId, limit, offset },
		poolId > 0,
	)
export const poolCandidates = (
	knownOnly: boolean,
	enabled = true,
): ResourceDefinition<PoolCandidatesData> => ({
	name: 'poolCandidates',
	key: [knownOnly],
	enabled,
	load: async (context) => {
		if (context.policy.sources.poolCandidates === 'staking-api')
			return queryStakingApi(
				POOL_CANDIDATES_QUERY,
				{ network: context.network, knownOnly },
				context.signal,
			)
		const { entries } = await context.request(poolDirectory())
		return {
			poolCandidates: entries
				.filter(([, pool]) => pool.state === 'Open')
				.map(([id]) => id),
		}
	},
})

export const poolMemberDetails = (addresses: string[], enabled = true) => ({
	name: 'poolMemberDetails' as const,
	key: [addresses],
	enabled,
	load: async ({ node }: import('../types').ResourceContext) => {
		if (!addresses.length) return []
		const [members, permissions] = await Promise.all([
			node.query.poolMembersMulti(addresses),
			node.query.claimPermissionsMulti(addresses),
		])
		return members.flatMap((member, index) =>
			member
				? [
						{
							...member,
							address: addresses[index],
							claimPermission: permissions[index],
						},
					]
				: [],
		)
	},
})
