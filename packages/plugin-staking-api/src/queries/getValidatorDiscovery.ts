// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, ValidatorDiscoveryData } from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
  query GetValidatorDiscovery($network: String!, $addresses: [String!]!) {
    getValidatorDiscovery(network: $network, addresses: $addresses) {
      address
      countryCode
      cloudProvider
    }
  }
`

const DEFAULT: ValidatorDiscoveryData = {
	getValidatorDiscovery: [],
}

export const useValidatorDiscovery = (variables: {
	network: string
	addresses: string[]
}): QueryReturn<ValidatorDiscoveryData> =>
	useApiQuery<ValidatorDiscoveryData>(QUERY, variables, DEFAULT)
