// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolWarningsData, PoolWarningsResult } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
	query PoolWarnings($network: String!, $addresses: [String!]!) {
		poolWarnings(network: $network, addresses: $addresses) {
			warnings {
				poolId
				address
				warningTypes
			}
		}
	}
`

const DEFAULT: PoolWarningsResult = {
	warnings: [],
}

export const fetchPoolWarnings = async (
	network: string,
	addresses: string[],
): Promise<PoolWarningsResult> => {
	if (addresses.length === 0) {
		return DEFAULT
	}
	const data = await fetchQuery<PoolWarningsData>(
		QUERY,
		{ network, addresses },
		{ poolWarnings: DEFAULT },
	)
	return { warnings: data.poolWarnings?.warnings || [] }
}
