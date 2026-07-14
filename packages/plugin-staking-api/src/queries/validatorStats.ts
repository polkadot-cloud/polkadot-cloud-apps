// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorStats, ValidatorStatsData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query ValidatorStats($network: String!) {
    averageRewardRate(chain: $network) {
      rate
    }
    activeValidatorRanks(network: $network) {
      rank
      validator
    }
  }
`

const DEFAULT: ValidatorStats = {
	averageRewardRate: {
		rate: 0,
	},
	activeValidatorRanks: [],
}

export const fetchValidatorStats = async (
	network: string,
): Promise<ValidatorStatsData> => {
	const result = await fetchQuery<ValidatorStats>(QUERY, { network }, DEFAULT, {
		fetchPolicy: 'network-only',
	})

	return {
		validatorStats: {
			...result,
		},
	}
}
