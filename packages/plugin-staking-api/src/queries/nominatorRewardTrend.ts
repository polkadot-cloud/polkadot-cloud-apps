// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { NominatorRewardTrendData, RewardTrend } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query NominatorRewardTrend($network: String!, $who: String!, $eras: Int!) {
    nominatorRewardTrend(network: $network, who: $who, eras: $eras) {
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

export const fetchNominatorRewardTrend = async (
	network: string,
	who: string,
	eras: number,
): Promise<RewardTrend> => {
	const data = await fetchQuery<NominatorRewardTrendData>(
		QUERY,
		{ network, who, eras },
		{ nominatorRewardTrend: DEFAULT },
	)
	return data.nominatorRewardTrend || DEFAULT
}
