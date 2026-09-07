// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { CombinedPoolRewardsData, QueryReturn } from '../types'
import { fetchQuery, useApiQuery } from './generic'

export const COMBINED_POOL_REWARDS_QUERY = gql`
  query CombinedPoolRewards(
    $network: String!
    $who: String!
    $first: Int
    $after: String
  ) {
    combinedPoolRewards(
      network: $network
      who: $who
      first: $first
      after: $after
    ) {
      entries {
        who
        poolId
        reward
        timestamp
        source
      }
      nextCursor
      hasNextPage
    }
  }
`

export const COMBINED_POOL_REWARDS_DEFAULT: CombinedPoolRewardsData = {
	combinedPoolRewards: {
		entries: [],
		nextCursor: null,
		hasNextPage: false,
	},
}

export const useCombinedPoolRewards = (
	variables: {
		network: string
		who: string
		first?: number
		after?: string
	},
	options?: { skip?: boolean },
): QueryReturn<CombinedPoolRewardsData> =>
	useApiQuery<CombinedPoolRewardsData>(
		COMBINED_POOL_REWARDS_QUERY,
		variables,
		COMBINED_POOL_REWARDS_DEFAULT,
		options,
	)

export const fetchCombinedPoolRewards = (
	network: string,
	who: string,
	first?: number,
	after?: string,
) =>
	fetchQuery<CombinedPoolRewardsData>(
		COMBINED_POOL_REWARDS_QUERY,
		{ network, who, first, after },
		COMBINED_POOL_REWARDS_DEFAULT,
	)
