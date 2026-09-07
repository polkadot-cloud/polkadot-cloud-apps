// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { AllRewardsData, QueryReturn } from '../types'
import { fetchQuery, useApiQuery } from './generic'

export const REWARDS_QUERY = gql`
  query AllRewards(
    $network: String!
    $who: String!
    $fromEra: Int!
    $limit: Int
    $offset: Int
  ) {
    allRewards(
      network: $network
      who: $who
      fromEra: $fromEra
      limit: $limit
      offset: $offset
    ) {
      claimed
      era
      reward
      timestamp
      validator
      type
    }
  }
`

export const REWARDS_DEFAULT: AllRewardsData = {
	allRewards: [],
}

export const useRewards = (variables: {
	network: string
	who: string
	fromEra: number
	limit?: number
	offset?: number
}): QueryReturn<AllRewardsData> =>
	useApiQuery<AllRewardsData>(REWARDS_QUERY, variables, REWARDS_DEFAULT)

export const fetchRewards = (
	network: string,
	who: string,
	fromEra: number,
	limit?: number,
	offset?: number,
) =>
	fetchQuery<AllRewardsData>(
		REWARDS_QUERY,
		{ network, who, fromEra, limit, offset },
		REWARDS_DEFAULT,
	)
