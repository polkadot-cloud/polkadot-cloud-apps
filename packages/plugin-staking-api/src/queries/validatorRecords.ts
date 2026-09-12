// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { IdentityCache } from '../types'
import { fetchQuery } from './generic'

export interface ValidatorRecord {
	address: string
	registered: boolean
	prefs: { commission: number; blocked: boolean } | null
	identity: Omit<IdentityCache, 'address'> | null
}

const QUERY = gql`
 query ValidatorRecords($network: String!, $addresses: [String!]!) {
  validatorRecords(network: $network, addresses: $addresses) {
   address registered prefs { commission blocked }
   identity { display superDisplay superValue }
  }
 }
`

export const fetchValidatorRecords = async (
	network: string,
	addresses: string[],
	signal: AbortSignal,
) => {
	const records: ValidatorRecord[] = []
	for (let i = 0; i < addresses.length; i += 100) {
		signal.throwIfAborted()
		const batch = addresses.slice(i, i + 100)
		const result = await fetchQuery<{ validatorRecords: ValidatorRecord[] }>(
			QUERY,
			{ network, addresses: batch },
			{ validatorRecords: [] },
			{
				throwOnError: true,
				fetchPolicy: 'no-cache',
				context: { fetchOptions: { signal }, queryDeduplication: false },
			},
		)
		signal.throwIfAborted()
		if (
			result.validatorRecords.length !== batch.length ||
			result.validatorRecords.some((record, j) => record.address !== batch[j])
		) {
			throw new Error('Incomplete validator records response')
		}
		records.push(...result.validatorRecords)
	}
	return records
}
