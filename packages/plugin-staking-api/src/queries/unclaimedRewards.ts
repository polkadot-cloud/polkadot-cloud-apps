// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, UnclaimedRewardsData } from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
  query UnclaimedRewards($network: String!, $who: String!, $fromEra: Int!) {
    unclaimedRewards(network: $network, who: $who, fromEra: $fromEra) {
      total
      entries {
        era
        reward
        validators {
          page
          reward
          validator
        }
      }
    }
  }
`

const DEFAULT: UnclaimedRewardsData = {
	unclaimedRewards: {
		total: '0',
		entries: [],
	},
}

export const useUnclaimedRewards = (variables: {
	network: string
	who: string
	fromEra: number
}): QueryReturn<UnclaimedRewardsData> =>
	useApiQuery<UnclaimedRewardsData>(QUERY, variables, DEFAULT)
