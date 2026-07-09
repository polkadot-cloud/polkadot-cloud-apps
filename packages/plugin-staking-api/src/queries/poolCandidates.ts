// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolCandidatesData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query PoolCandidates($network: String!, $knownOnly: Boolean = false) {
    poolCandidates(network: $network, knownOnly: $knownOnly)
  }
`

const DEFAULT: PoolCandidatesData = {
	poolCandidates: [],
}

export const fetchPoolCandidates = (network: string, knownOnly = false) =>
	fetchQuery<PoolCandidatesData>(QUERY, { network, knownOnly }, DEFAULT)
