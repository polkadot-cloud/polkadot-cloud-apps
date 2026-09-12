// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { SearchValidatorsData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query SearchValidators($network: String!, $searchTerm: String!, $maxCommission: Float, $limit: Int) {
    searchValidators(network: $network, searchTerm: $searchTerm, maxCommission: $maxCommission, limit: $limit) {
      total
      validators {
        address
        commission
        blocked
        display
        superDisplay
      }
    }
  }
`

const DEFAULT: SearchValidatorsData = {
	searchValidators: {
		total: 0,
		validators: [],
	},
}

export const fetchSearchValidators = (
	network: string,
	searchTerm: string,
	options?: { maxCommission?: number; limit?: number; signal?: AbortSignal },
) =>
	fetchQuery<SearchValidatorsData>(
		QUERY,
		{
			network,
			searchTerm,
			maxCommission: options?.maxCommission,
			limit: options?.limit,
		},
		DEFAULT,
		{
			throwOnError: true,
			fetchPolicy: 'no-cache',
			context: {
				fetchOptions: { signal: options?.signal },
				queryDeduplication: false,
			},
		},
	)
