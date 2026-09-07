// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, ValidatorRewardsData } from '../types'
import { useApiQuery } from './generic'

export const VALIDATOR_REWARDS_QUERY = gql`
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

export const VALIDATOR_REWARDS_DEFAULT: ValidatorRewardsData = {
	validatorRewards: [],
}

export const useValidatorRewards = (variables: {
	network: string
	validator: string
	fromEra: number
	depth?: number
}): QueryReturn<ValidatorRewardsData> =>
	useApiQuery<ValidatorRewardsData>(
		VALIDATOR_REWARDS_QUERY,
		variables,
		VALIDATOR_REWARDS_DEFAULT,
	)
