// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { bnToU8a, concatU8a, encodeAddress, stringToU8a } from 'dedot/utils'
import type { BondedPool, NominationStatus, NominationStatuses } from 'types'

// Generates pool stash and reward accounts. Assumes `poolsPalletId` is synced
export const createPoolAccounts = (
	poolId: number,
	poolsPalletId: Uint8Array,
	ss58Format: number = 0,
) => {
	const createAccount = (index: number): string => {
		const key = concatU8a(
			stringToU8a('modl'),
			poolsPalletId,
			new Uint8Array([index]),
			bnToU8a(BigInt(poolId.toString())).reverse(), // NOTE: Reversing for little endian
			new Uint8Array(32),
		)
		return encodeAddress(key.slice(0, 32), ss58Format)
	}

	return {
		stash: createAccount(0),
		reward: createAccount(1),
	}
}

// Pool search filter function for finding pools by ID, metadata, or address
export const poolSearchFilter = (
	pools: BondedPool[],
	searchTerm: string,
	poolsMetaData: Record<number, string> = {},
): BondedPool[] => {
	// Pre-compute values that are constant across all iterations
	const hasMetadata = Object.keys(poolsMetaData).length > 0
	const searchTermLower = searchTerm.toLowerCase()
	const numbersInSearch = searchTerm.match(/\d+/g)

	// Track added pool IDs to avoid O(n²) dedup at the end
	const seen = new Set<number>()
	const filteredList: BondedPool[] = []

	for (const pool of pools) {
		// If pool metadata has not yet been synced, include the pool in results
		if (!hasMetadata) {
			if (!seen.has(pool.id)) {
				seen.add(pool.id)
				filteredList.push(pool)
			}
			continue
		}

		const address = pool?.addresses?.stash ?? ''
		const metadata = poolsMetaData[pool.id] || ''
		const poolIdStr = String(pool.id)

		// Enhanced pool ID matching logic
		let poolIdMatches = false

		// 1. Direct number match (e.g., "123" matches pool 123)
		if (poolIdStr === searchTerm) {
			poolIdMatches = true
		}
		// 2. Pool ID contains the search term (for partial matches)
		else if (poolIdStr.includes(searchTermLower)) {
			poolIdMatches = true
		}
		// 3. "Pool X" format (e.g., "Pool 123" should match pool 123)
		else if (searchTermLower.startsWith('pool ')) {
			const poolNumber = searchTermLower.replace('pool ', '').trim()
			if (poolIdStr === poolNumber) {
				poolIdMatches = true
			}
		}
		// 4. Extract numbers from search term and match against pool ID
		else if (numbersInSearch) {
			for (const num of numbersInSearch) {
				if (poolIdStr === num) {
					poolIdMatches = true
					break
				}
			}
		}

		const addressMatches = address.toLowerCase().includes(searchTermLower)
		const metadataMatches = metadata.toLowerCase().includes(searchTermLower)

		if (
			(poolIdMatches || addressMatches || metadataMatches) &&
			!seen.has(pool.id)
		) {
			seen.add(pool.id)
			filteredList.push(pool)
		}
	}

	return filteredList
}

// Determine bonded pool's current nomination status
export const getPoolNominationStatusCode = (
	statuses: NominationStatuses | null,
) => {
	let status: NominationStatus = 'waiting'

	if (statuses) {
		for (const childStatus of Object.values(statuses)) {
			if (childStatus === 'active') {
				status = 'active'
				break
			}
			if (childStatus === 'inactive') {
				status = 'inactive'
			}
		}
	}
	return status
}
