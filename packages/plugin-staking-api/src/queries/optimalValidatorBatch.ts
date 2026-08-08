// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	OptimalValidatorBatchData,
	OptimalValidatorBatchVariables,
} from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
	query FetchOptimalValidatorBatch(
		$network: String!
		$active: Boolean = true
		$excludeAddresses: [String!] = []
	) {
		fetchOptimalValidatorBatch(
			network: $network
			active: $active
			excludeAddresses: $excludeAddresses
		) {
			address
			prefs {
				commission
				blocked
			}
		}
	}
`

const DEFAULT: OptimalValidatorBatchData = {
	fetchOptimalValidatorBatch: [],
}

export const fetchOptimalValidatorBatch = (
	variables: OptimalValidatorBatchVariables,
) => fetchQuery<OptimalValidatorBatchData>(QUERY, variables, DEFAULT)
