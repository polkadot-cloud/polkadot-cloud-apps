// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { formatAccountSs58 } from '@w3ux/util-dedot'
import type { DedotClient, SubmittableExtrinsic } from 'dedot'
import type { GenericSubstrateApi } from 'dedot/types'
import type { Bonded, ChainId, ImportedAccount } from 'types'
import type { ServiceClass } from './types'

export const hasApiHub = (
	instance: ServiceClass,
): instance is ServiceClass & { apiHub: DedotClient<GenericSubstrateApi> } =>
	'apiHub' in instance

// Gets added, removed and remaining accounts by comparing two lists of accounts
export const diffImportedAccounts = (
	prev: ImportedAccount[],
	cur: ImportedAccount[],
) => {
	const getAccountId = (account: ImportedAccount): string =>
		`${account.source}:${account.address}`

	const prevMap = new Map(prev.map((a) => [getAccountId(a), a]))
	const curMap = new Map(cur.map((a) => [getAccountId(a), a]))

	const added = [...curMap.keys()]
		.filter((k) => !prevMap.has(k))
		.map((k) => curMap.get(k)!)

	const removed = [...prevMap.keys()]
		.filter((k) => !curMap.has(k))
		.map((k) => prevMap.get(k)!)

	const remaining = cur.filter(
		(v) =>
			!added.some(
				({ address, source }) => address === v.address && source === v.source,
			),
	)

	return { added, removed, remaining }
}

// Gets added and removed pool ids by comparing two lists of pool ids
export const diffPoolIds = (prev: number[], cur: number[]) => {
	const prevSet = new Set(prev)
	const curSet = new Set(cur)

	const added = cur.filter((id) => !prevSet.has(id))
	const removed = prev.filter((id) => !curSet.has(id))

	return { added, removed }
}

// Gets added and removed bonded accounts by comparing stashes
export const diffBonded = (prev: Bonded[], cur: Bonded[]) => {
	const prevSet = new Set(prev)
	const curSet = new Set(cur)

	const added = cur.filter(
		({ stash, bonded }) =>
			![...prevSet].find((p) => p.stash === stash && p.bonded === bonded),
	)
	const removed = prev.filter(
		({ stash, bonded }) =>
			![...curSet].find((c) => c.stash === stash && c.bonded === bonded),
	)
	return { added, removed }
}

// Gets the account record key for a specific chain and account address
export const getAccountKey = (chain: ChainId, address: string) =>
	`${chain}:${address}`

// Gets type-safe keys from an object
export const keysOf = <T extends Record<string, unknown>>(obj: T) =>
	Object.keys(obj) as (keyof typeof obj)[]

// Casts a transaction to a SubmittableExtrinsic type
export const asTx = <T>(tx: T) => tx as SubmittableExtrinsic

// Casts a transaction array to a SubmittableExtrinsic[] type
export const asTxs = <T>(txs: T[]) =>
	// for each array element, cast to SubmittableExtrinsic
	txs.map((t) => t as SubmittableExtrinsic)

// Format account adddresses to an ss58 format
export const formatAccountAddresses = (
	accounts: ImportedAccount[],
	ss58: number,
): ImportedAccount[] =>
	accounts
		.map((account) => {
			const address = formatAccountSs58(account.address, ss58)
			if (!address) {
				return undefined
			}
			return {
				...account,
				address,
			}
		})
		.filter((account) => account !== undefined)
