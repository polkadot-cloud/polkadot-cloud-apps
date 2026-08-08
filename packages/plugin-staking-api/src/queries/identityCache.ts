// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { IdentityCacheData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query IdentityCache($network: String!, $addresses: [String!]!) {
    identityCache(network: $network, addresses: $addresses) {
      address
      display
      superDisplay
      superValue
    }
  }
`

const BATCH_SIZE = 500
const EMPTY: IdentityCacheData = { identityCache: [] }

export const fetchIdentityCache = async (
	network: string,
	addresses: string[],
): Promise<IdentityCacheData> => {
	// Batch addresses into chunks of BATCH_SIZE to avoid exceeding API limits
	const batches: string[][] = []
	for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
		batches.push(addresses.slice(i, i + BATCH_SIZE))
	}

	const results = await Promise.all(
		batches.map((batch) =>
			fetchQuery<IdentityCacheData>(
				QUERY,
				{ network, addresses: batch },
				EMPTY,
			),
		),
	)

	return {
		identityCache: results.flatMap((result) => result.identityCache || []),
	}
}
