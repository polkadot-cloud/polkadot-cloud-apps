// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, ValidatorRewardsData } from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
  query ValidatorRewards(
    $network: String!
    $validator: String!
    $fromEra: Int!
    $depth: Int
  ) {
    validatorRewards(
      network: $network
      validator: $validator
      fromEra: $fromEra
      depth: $depth
    ) {
      era
      reward
      start
    }
  }
`

const DEFAULT: ValidatorRewardsData = {
	validatorRewards: [],
}

export const useValidatorRewards = (variables: {
	network: string
	validator: string
	fromEra: number
	depth?: number
}): QueryReturn<ValidatorRewardsData> =>
	useApiQuery<ValidatorRewardsData>(QUERY, variables, DEFAULT)
