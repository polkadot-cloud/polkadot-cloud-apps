// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { AllRewardsData, QueryReturn } from '../types'
import { fetchQuery, useApiQuery } from './generic'

const QUERY = gql`
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

const DEFAULT: AllRewardsData = {
	allRewards: [],
}

export const useRewards = (variables: {
	network: string
	who: string
	fromEra: number
	limit?: number
	offset?: number
}): QueryReturn<AllRewardsData> =>
	useApiQuery<AllRewardsData>(QUERY, variables, DEFAULT)

export const fetchRewards = (
	network: string,
	who: string,
	fromEra: number,
	limit?: number,
	offset?: number,
) =>
	fetchQuery<AllRewardsData>(
		QUERY,
		{ network, who, fromEra, limit, offset },
		DEFAULT,
	)
