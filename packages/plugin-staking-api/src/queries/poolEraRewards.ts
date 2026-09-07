// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolEraRewardsData, QueryReturn } from '../types'
import { fetchQuery, useApiQuery } from './generic'

export const POOL_ERA_REWARDS_QUERY = gql`
  query PoolEraRewards($network: String!, $who: String!, $fromEra: Int!) {
    poolEraRewards(network: $network, who: $who, fromEra: $fromEra) {
      who
      poolId
      reward
      timestamp
    }
  }
`

export const POOL_ERA_REWARDS_DEFAULT: PoolEraRewardsData = {
	poolEraRewards: [],
}

export const usePoolEraRewards = ({
	network,
	who,
	fromEra,
	skip,
}: {
	network: string
	who: string
	fromEra: number
	skip?: boolean
}): QueryReturn<PoolEraRewardsData> =>
	useApiQuery<PoolEraRewardsData>(
		POOL_ERA_REWARDS_QUERY,
		{ network, who, fromEra },
		POOL_ERA_REWARDS_DEFAULT,
		{
			skip,
		},
	)

export const fetchPoolEraRewards = (
	network: string,
	who: string,
	fromEra: number,
) =>
	fetchQuery<PoolEraRewardsData>(
		POOL_ERA_REWARDS_QUERY,
		{ network, who, fromEra },
		POOL_ERA_REWARDS_DEFAULT,
	)
