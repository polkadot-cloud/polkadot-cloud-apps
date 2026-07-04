// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ellipsisFn } from '@w3ux/utils'
import type { IdentityOf, SuperIdentity, SuperOf } from 'types'

export interface IdentityCache {
	address: string
	display: string | null
	superDisplay: string | null
	superValue: string | null
}

// Format identities into records with addresses as keys
export const formatIdentities = (
	addresses: string[],
	identities: IdentityOf[],
) =>
	identities.reduce((acc: Record<string, IdentityOf | undefined>, cur, i) => {
		acc[addresses[i]] = cur
		return acc
	}, {})

// Format super identities into records with addresses as keys
export const formatSuperIdentities = (supers: SuperOf[]) =>
	supers.reduce((acc: Record<string, SuperIdentity>, cur) => {
		if (!cur) {
			return acc
		}
		acc[cur.address] = {
			superOf: {
				identity: cur.identity,
				value: cur.value,
			},
			value: cur.value?.value || '',
		}
		return acc
	}, {})

// Format identities from GraphQL cache into records with addresses as keys
export const formatIdentitiesFromCache = (
	addresses: string[],
	identityCache: IdentityCache[],
) => {
	const cacheByAddress = identityCache.reduce(
		(acc: Record<string, IdentityCache>, cacheEntry) => {
			acc[cacheEntry.address] = cacheEntry
			return acc
		},
		{},
	)

	return addresses.reduce(
		(acc: Record<string, IdentityOf | undefined>, address) => {
			const cacheEntry = cacheByAddress[address]
			if (cacheEntry && (cacheEntry.display || cacheEntry.superDisplay)) {
				acc[address] = {
					info: {
						display: {
							type: 'Raw',
							value: cacheEntry.display || undefined,
						},
					},
					judgements: [[0, { type: 'Unknown' }]],
					deposit: 0n,
				}
			} else {
				acc[address] = undefined
			}
			return acc
		},
		{},
	)
}

// Format super identities from GraphQL cache into records with addresses as keys
export const formatSuperIdentitiesFromCache = (
	identityCache: IdentityCache[],
) =>
	identityCache.reduce((acc: Record<string, SuperIdentity>, cacheEntry) => {
		if (cacheEntry.superDisplay !== null) {
			acc[cacheEntry.address] = {
				superOf: {
					identity: {
						info: {
							display: {
								type: 'Raw',
								value: cacheEntry.superDisplay || undefined,
							},
						},
						judgements: [[0, { type: 'Unknown' }]],
						deposit: 0n,
					},
					value: {
						type: 'Raw',
						value: cacheEntry.superValue || undefined,
					},
				},
				value: cacheEntry.superValue || '',
			}
		}
		return acc
	}, {})

// Format an identity value, falling back to an ellipsis of the address if no identity is provided
export const formatIdentityValue = (address: string, identity?: string) =>
	identity || ellipsisFn(address, 8)
