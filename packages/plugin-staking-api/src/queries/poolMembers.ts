// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolMembersData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
	query PoolMembers($network: String!, $poolId: Int!, $limit: Int, $offset: Int) {
		poolMembers(network: $network, poolId: $poolId, limit: $limit, offset: $offset) {
			poolId
			totalMembers
			members {
      	poolId
				address
				points
				unbondingEras {
					era
					amount
				}
			}
		}
	}
`

const DEFAULT: PoolMembersData = {
	poolMembers: {
		poolId: 0,
		totalMembers: 0,
		members: [],
	},
}

export const fetchPoolMembers = (
	network: string,
	poolId: number,
	limit?: number,
	offset?: number,
) =>
	fetchQuery<PoolMembersData>(
		QUERY,
		{ network, poolId, limit, offset },
		DEFAULT,
	)
