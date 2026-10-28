// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { GetValidatorWarningsData, ValidatorWarnings } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query GetValidatorWarnings($network: String!, $candidates: [String!]!, $who: String!) {
    getValidatorWarnings(network: $network, candidates: $candidates, who: $who) {
      candidate
      warnings
    }
  }
`

export const fetchGetValidatorWarnings = async (
	network: string,
	candidates: string[],
	options?: { throwOnError?: boolean; who?: string | null },
): Promise<ValidatorWarnings> => {
	const { who, ...queryOptions } = options ?? {}
	if (candidates.length === 0 || !who) {
		return {}
	}
	const data = await fetchQuery<GetValidatorWarningsData>(
		QUERY,
		{ network, candidates, who },
		{ getValidatorWarnings: [] },
		{ fetchPolicy: 'no-cache', ...queryOptions },
	)
	return Object.fromEntries(
		(data.getValidatorWarnings ?? []).map(({ candidate, warnings }) => [
			candidate,
			warnings ?? [],
		]),
	)
}
