// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	RandomValidatorCandidateData,
	RandomValidatorCandidateVariables,
} from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query RandomValidatorCandidate(
    $network: String!
    $strategy: ValidatorCandidateStrategy!
    $active: Boolean = true
    $excludeAddresses: [String!] = []
    $topPercent: Int = 50
  ) {
    randomValidatorCandidate(
      network: $network
      strategy: $strategy
      active: $active
      excludeAddresses: $excludeAddresses
      topPercent: $topPercent
    ) {
      address
      prefs {
        commission
        blocked
      }
    }
  }
`

const DEFAULT: RandomValidatorCandidateData = {
	randomValidatorCandidate: null,
}

export const fetchRandomValidatorCandidate = (
	variables: RandomValidatorCandidateVariables,
) =>
	fetchQuery<RandomValidatorCandidateData>(QUERY, variables, DEFAULT, {
		fetchPolicy: 'no-cache',
	})
