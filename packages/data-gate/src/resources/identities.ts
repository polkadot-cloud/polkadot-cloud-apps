// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { IDENTITY_CACHE_QUERY } from 'plugin-staking-api'
import type { IdentityCacheData } from 'plugin-staking-api/types'
import type { IdentityOf, SuperIdentity } from 'types'
import {
	formatIdentities,
	formatIdentitiesFromCache,
	formatSuperIdentities,
	formatSuperIdentitiesFromCache,
} from 'utils'
import { mapInBatches } from '../sources/node'
import { queryStakingApi } from '../sources/stakingApi'
import type { ResourceDefinition } from '../types'

export const identities = (
	addresses: readonly string[],
): ResourceDefinition<{
	identities: Record<string, IdentityOf>
	supers: Record<string, SuperIdentity>
}> => {
	const unique = [...new Set(addresses)].sort()
	return {
		name: 'identities',
		key: [unique],
		enabled: unique.length > 0,
		load: async (context) => {
			const { network, policy, signal } = context
			if (policy.sources.identities === 'staking-api') {
				const batches: string[][] = []
				for (let i = 0; i < unique.length; i += 500)
					batches.push(unique.slice(i, i + 500))
				const result = await mapInBatches(batches, (batch) =>
					queryStakingApi<IdentityCacheData>(
						IDENTITY_CACHE_QUERY,
						{ network, addresses: batch },
						signal,
					),
				)
				const cache = result.flatMap(({ identityCache }) => identityCache)
				return {
					identities: formatIdentitiesFromCache(unique, cache),
					supers: formatSuperIdentitiesFromCache(cache),
				}
			}
			const [identityValues, superValues] = await Promise.all([
				context.node.query.identityOfMulti(unique),
				context.node.query.superOfMulti(unique),
			])
			return {
				identities: formatIdentities(unique, identityValues),
				supers: formatSuperIdentities(superValues),
			}
		},
	}
}
