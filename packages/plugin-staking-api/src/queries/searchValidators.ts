// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { SearchValidatorsData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query SearchValidators($network: String!, $searchTerm: String!) {
    searchValidators(network: $network, searchTerm: $searchTerm) {
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

export const fetchSearchValidators = (network: string, searchTerm: string) =>
	fetchQuery<SearchValidatorsData>(QUERY, { network, searchTerm }, DEFAULT)
