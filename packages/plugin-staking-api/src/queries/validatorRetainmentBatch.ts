// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorRetainmentBatchData } from '../types'
import { fetchQuery } from './generic'

export const VALIDATOR_RETAINMENT_BATCH_FIELDS = gql`
  fragment ValidatorRetainmentBatchFields on ValidatorRetainmentBatch {
    validator
    result {
      identityGraphId
      accounts {
        address
        super
        subs
        validator
      }
      validators
      era
      timestamp
      assetHubBlockNumber
      peopleBlockNumber
      months {
        month
        year
        fromEra
        toEra
        fromTimestamp
        toTimestamp
        graphRewards
        retained
        retainmentRate
        validatorRewards
        compounded
        compoundRate
      }
    }
  }
`

const QUERY = gql`
  ${VALIDATOR_RETAINMENT_BATCH_FIELDS}
  query ValidatorRetainmentBatch(
    $network: String!
    $validators: [String!]!
  ) {
    validatorRetainmentBatch(network: $network, validators: $validators) {
      ...ValidatorRetainmentBatchFields
    }
  }
`

const DEFAULT: ValidatorRetainmentBatchData = {
	validatorRetainmentBatch: [],
}

export const fetchValidatorRetainmentBatch = (
	network: string,
	validators: string[],
) =>
	fetchQuery<ValidatorRetainmentBatchData>(
		QUERY,
		{ network, validators },
		DEFAULT,
	)
