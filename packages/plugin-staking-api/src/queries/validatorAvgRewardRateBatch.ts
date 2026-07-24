// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorAvgRewardRateBatchData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query ValidatorAvgRewardRateBatch(
    $chain: String!
    $validators: [String!]!
    $fromEra: Int!
    $depth: Int
  ) {
    validatorAvgRewardRateBatch(
      chain: $chain
      validators: $validators
      fromEra: $fromEra
      depth: $depth
    ) {
      validator
      rate
    }
  }
`
const DEFAULT: ValidatorAvgRewardRateBatchData = {
	validatorAvgRewardRateBatch: [],
}

export const fetchValidatorAvgRewardRateBatch = (
	chain: string,
	validators: string[],
	fromEra: number,
	depth?: number,
) =>
	fetchQuery<ValidatorAvgRewardRateBatchData>(
		QUERY,
		{ chain, validators, fromEra, depth },
		DEFAULT,
	)
