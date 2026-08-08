// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, ValidatorEraPointsData } from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
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
const DEFAULT: ValidatorEraPointsData = {
	validatorEraPoints: [],
}

export const useValidatorEraPoints = (variables: {
	network: string
	validator: string
	fromEra: number
	depth?: number
}): QueryReturn<ValidatorEraPointsData> =>
	useApiQuery<ValidatorEraPointsData>(QUERY, variables, DEFAULT)
