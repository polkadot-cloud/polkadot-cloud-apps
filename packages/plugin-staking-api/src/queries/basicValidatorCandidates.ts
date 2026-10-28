// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ValidatorCandidate } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query BasicValidatorCandidates($network: String!, $strategy: BasicValidatorStrategy!, $excludeAddresses: [String!]!) {
    basicValidatorCandidates(network: $network, strategy: $strategy, excludeAddresses: $excludeAddresses) {
      address
      prefs { commission blocked }
    }
  }
`

export const fetchBasicValidatorCandidates = async (
	network: string,
	strategy: 'RANDOM' | 'ACTIVE' | 'HIGH_ACTIVITY' | 'OPTIMAL',
	excludeAddresses: string[] = [],
): Promise<ValidatorCandidate[]> => {
	const result = await fetchQuery<{
		basicValidatorCandidates: ValidatorCandidate[]
	}>(
		QUERY,
		{ network, strategy, excludeAddresses },
		{ basicValidatorCandidates: [] },
		{ fetchPolicy: 'no-cache', throwOnError: true },
	)
	return result.basicValidatorCandidates
}
