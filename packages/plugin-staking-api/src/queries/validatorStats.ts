// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorStatsData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query ValidatorStats($network: String!) {
    validatorStats(network: $network) {
      averageRewardRate {
        rate
      }
      averageValidatorCommission
      activeValidatorRanks {
        rank
        validator
      }
    }
  }
`
const DEFAULT: ValidatorStatsData = {
	validatorStats: {
		averageRewardRate: {
			rate: 0,
		},
		averageValidatorCommission: 0,
		activeValidatorRanks: [],
	},
}

export const fetchValidatorStats = (network: string) =>
	fetchQuery<ValidatorStatsData>(QUERY, { network }, DEFAULT)
