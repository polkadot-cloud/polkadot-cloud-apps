// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolRewardData, QueryReturn } from '../types'
import { fetchQuery, useApiQuery } from './generic'

const QUERY = gql`
  query PoolRewards(
    $network: String!
    $who: String!
    $from: Int!
    $limit: Int
    $offset: Int
  ) {
    poolRewards(
      network: $network
      who: $who
      from: $from
      limit: $limit
      offset: $offset
    ) {
      poolId
      reward
      timestamp
      who
    }
  }
`

const DEFAULT: PoolRewardData = {
	poolRewards: [],
}

export const usePoolRewards = (variables: {
	network: string
	who: string
	from: number
	limit?: number
	offset?: number
}): QueryReturn<PoolRewardData> =>
	useApiQuery<PoolRewardData>(QUERY, variables, DEFAULT)

export const fetchPoolRewards = (
	network: string,
	who: string,
	from: number,
	limit?: number,
	offset?: number,
) =>
	fetchQuery<PoolRewardData>(
		QUERY,
		{ network, who, from, limit, offset },
		DEFAULT,
	)
