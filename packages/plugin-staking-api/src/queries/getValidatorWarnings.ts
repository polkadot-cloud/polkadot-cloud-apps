// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { GetValidatorWarningsData, ValidatorWarnings } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query GetValidatorWarnings($network: String!, $candidates: [String!]!) {
    getValidatorWarnings(network: $network, candidates: $candidates) {
      candidate
      warnings
    }
  }
`

export const fetchGetValidatorWarnings = async (
	network: string,
	candidates: string[],
): Promise<ValidatorWarnings> => {
	if (candidates.length === 0) {
		return {}
	}
	const data = await fetchQuery<GetValidatorWarningsData>(
		QUERY,
		{ network, candidates },
		{ getValidatorWarnings: [] },
		{ fetchPolicy: 'no-cache' },
	)
	return Object.fromEntries(
		(data.getValidatorWarnings ?? []).map(({ candidate, warnings }) => [
			candidate,
			warnings ?? [],
		]),
	)
}
