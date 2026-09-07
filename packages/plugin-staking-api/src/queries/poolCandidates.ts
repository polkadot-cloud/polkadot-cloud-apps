// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolCandidatesData } from '../types'
import { fetchQuery } from './generic'

export const POOL_CANDIDATES_QUERY = gql`
  query PoolCandidates($network: String!, $knownOnly: Boolean!) {
    poolCandidates(network: $network, knownOnly: $knownOnly)
  }
`

export const POOL_CANDIDATES_DEFAULT: PoolCandidatesData = {
	poolCandidates: [],
}

export const fetchPoolCandidates = (network: string, knownOnly: boolean) =>
	fetchQuery<PoolCandidatesData>(
		POOL_CANDIDATES_QUERY,
		{ network, knownOnly },
		POOL_CANDIDATES_DEFAULT,
	)
