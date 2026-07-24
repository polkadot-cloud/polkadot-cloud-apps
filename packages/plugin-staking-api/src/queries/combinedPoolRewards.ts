// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { CombinedPoolRewardsData, QueryReturn } from '../types'
import { fetchQuery, useApiQuery } from './generic'

const QUERY = gql`
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

const DEFAULT: CombinedPoolRewardsData = {
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
	useApiQuery<CombinedPoolRewardsData>(QUERY, variables, DEFAULT, options)

export const fetchCombinedPoolRewards = (
	network: string,
	who: string,
	first?: number,
	after?: string,
) =>
	fetchQuery<CombinedPoolRewardsData>(
		QUERY,
		{ network, who, first, after },
		DEFAULT,
	)
