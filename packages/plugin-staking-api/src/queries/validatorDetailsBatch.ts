// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorDetailsBatchData } from '../types'
import { VALIDATOR_RETAINMENT_FIELDS } from './fragments/retainment'
import { fetchQuery } from './generic'

const QUERY = gql`
  ${VALIDATOR_RETAINMENT_FIELDS}
  query ValidatorDetailsBatch(
    $network: String!
    $validators: [String!]!
    $fromEra: Int!
    $rewardRateDepth: Int
    $eraPointsDepth: Int
    $includeRetainment: Boolean!
  ) {
    validatorRetainmentBatch(network: $network, validators: $validators) @include(if: $includeRetainment) {
      validator
      result {
        months { ...ValidatorRetainmentWindowFields }
        retainment { ...ValidatorRetainmentFields }
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

export const fetchValidatorDetailsBatch = async (
	network: string,
	validators: string[],
	fromEra: number,
	rewardRateDepth?: number,
	eraPointsDepth?: number,
	options?: { throwOnError?: boolean; includeRetainment?: boolean },
) => {
	const data = await fetchQuery<ValidatorDetailsBatchData>(
		QUERY,
		{
			network,
			validators,
			fromEra,
			rewardRateDepth,
			eraPointsDepth,
			includeRetainment: options?.includeRetainment ?? true,
		},
		DEFAULT,
		options,
	)

	return {
		...data,
		validatorRetainmentBatch: data.validatorRetainmentBatch ?? [],
	}
}
