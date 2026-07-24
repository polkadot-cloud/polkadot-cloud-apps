// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolRewardTrendData, RewardTrend } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query PoolRewardTrend($network: String!, $who: String!, $duration: Int!) {
    poolRewardTrend(network: $network, who: $who, duration: $duration) {
      reward
      previous
      change {
        percent
        value
      }
    }
  }
`

const DEFAULT: RewardTrend = {
	reward: '0',
	previous: '0',
	change: {
		percent: '0',
		value: '0',
	},
}

export const fetchPoolRewardTrend = async (
	network: string,
	who: string,
	duration: number,
): Promise<RewardTrend> => {
	const data = await fetchQuery<PoolRewardTrendData>(
		QUERY,
		{ network, who, duration },
		{ poolRewardTrend: DEFAULT },
	)
	return data.poolRewardTrend || DEFAULT
}
