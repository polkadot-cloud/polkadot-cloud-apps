// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	TrustedWaitingValidatorsData,
	TrustedWaitingValidatorsVariables,
} from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
	query FetchTrustedWaitingValidators(
		$network: String!
		$addresses: [String!]!
		$count: Int!
	) {
		fetchTrustedWaitingValidators(
			network: $network
			addresses: $addresses
			count: $count
		) {
			address
			prefs {
				commission
				blocked
			}
		}
	}
`

const DEFAULT: TrustedWaitingValidatorsData = {
	fetchTrustedWaitingValidators: [],
}

export const fetchTrustedWaitingValidators = (
	variables: TrustedWaitingValidatorsVariables,
) =>
	fetchQuery<TrustedWaitingValidatorsData>(QUERY, variables, DEFAULT, {
		fetchPolicy: 'no-cache',
	})
