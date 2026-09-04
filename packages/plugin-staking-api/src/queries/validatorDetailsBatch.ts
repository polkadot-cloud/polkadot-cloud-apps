// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorDetailsBatchData } from '../types'
import { fetchQuery } from './generic'
import { THREE_MONTH_VALIDATOR_RETAINMENT } from './retainmentFragments'

const QUERY = gql`
  ${THREE_MONTH_VALIDATOR_RETAINMENT}
  query ValidatorDetailsBatch(
    $network: String!
    $validators: [String!]!
    $fromEra: Int!
    $rewardRateDepth: Int
    $eraPointsDepth: Int
  ) {
    validatorRetainmentBatch(network: $network, validators: $validators) {
      validator
      result {
        months {
          fromTimestamp
          ...ThreeMonthValidatorRetainment
        }
      }
    }
    validatorAvgRewardRateBatch(
      chain: $network
      validators: $validators
      fromEra: $fromEra
      depth: $rewardRateDepth
    ) {
      validator
      rate
    }
    validatorEraPointsBatch(
      network: $network
      validators: $validators
      fromEra: $fromEra
      depth: $eraPointsDepth
    ) {
      validator
      points {
        era
        points
        start
      }
    }
  }
`

const DEFAULT: ValidatorDetailsBatchData = {
	validatorRetainmentBatch: [],
	validatorAvgRewardRateBatch: [],
	validatorEraPointsBatch: [],
}

export const fetchValidatorDetailsBatch = (
	network: string,
	validators: string[],
	fromEra: number,
	rewardRateDepth?: number,
	eraPointsDepth?: number,
) =>
	fetchQuery<ValidatorDetailsBatchData>(
		QUERY,
		{
			network,
			validators,
			fromEra,
			rewardRateDepth,
			eraPointsDepth,
		},
		DEFAULT,
	)
