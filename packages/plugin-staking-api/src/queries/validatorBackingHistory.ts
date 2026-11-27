// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import { useApiQuery } from './generic'

interface BackingHistoryData {
	validatorBackingHistory: {
		era: number
		totalBacking: string | null
		nominatorCount: number | null
	}[]
}

const QUERY = gql`
  query ValidatorBackingHistory($network: String!, $validator: String!, $toEra: Int!) {
    validatorBackingHistory(network: $network, validator: $validator, toEra: $toEra) {
      era
      totalBacking
      nominatorCount
    }
  }
`

export const useValidatorBackingHistory = (variables: {
	network: string
	validator: string
	toEra: number
}) =>
	useApiQuery<BackingHistoryData>(
		QUERY,
		variables,
		{ validatorBackingHistory: [] },
		{ skip: variables.network !== 'polkadot' || variables.toEra < 0 },
	)
