// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, ValidatorEraPointsData } from '../types'
import { useApiQuery } from './generic'

export const VALIDATOR_ERA_POINTS_QUERY = gql`
  query ValidatorEraPoints(
    $network: String!
    $validator: String!
    $fromEra: Int!
    $depth: Int
  ) {
    validatorEraPoints(
      network: $network
      validator: $validator
      fromEra: $fromEra
      depth: $depth
    ) {
      era
      points
      start
    }
  }
`
export const VALIDATOR_ERA_POINTS_DEFAULT: ValidatorEraPointsData = {
	validatorEraPoints: [],
}

export const useValidatorEraPoints = (variables: {
	network: string
	validator: string
	fromEra: number
	depth?: number
}): QueryReturn<ValidatorEraPointsData> =>
	useApiQuery<ValidatorEraPointsData>(
		VALIDATOR_ERA_POINTS_QUERY,
		variables,
		VALIDATOR_ERA_POINTS_DEFAULT,
	)
