// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorEraPointsBatchData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query ValidatorEraPointsBatch(
    $network: String!
    $validators: [String!]!
    $fromEra: Int!
    $depth: Int
  ) {
    validatorEraPointsBatch(
      network: $network
      validators: $validators
      fromEra: $fromEra
      depth: $depth
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

const DEFAULT: ValidatorEraPointsBatchData = {
	validatorEraPointsBatch: [],
}

export const fetchValidatorEraPointsBatch = (
	network: string,
	validators: string[],
	fromEra: number,
	depth?: number,
) =>
	fetchQuery<ValidatorEraPointsBatchData>(
		QUERY,
		{ network, validators, fromEra, depth },
		DEFAULT,
	)
