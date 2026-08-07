// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorDetailsBatchData } from '../types'
import { fetchQuery } from './generic'
import { VALIDATOR_RETAINMENT_BATCH_FIELDS } from './validatorRetainmentBatch'

const QUERY = gql`
  ${VALIDATOR_RETAINMENT_BATCH_FIELDS}
  query ValidatorDetailsBatch(
    $network: String!
    $validators: [String!]!
    $fromEra: Int!
    $rewardRateDepth: Int
    $eraPointsDepth: Int
  ) {
    validatorRetainmentBatch(network: $network, validators: $validators) {
      ...ValidatorRetainmentBatchFields
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
        validator
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
