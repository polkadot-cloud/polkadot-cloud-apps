// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { ActiveValidatorRanksData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query ActiveValidatorRanks($network: String!) {
    activeValidatorRanks(network: $network) {
      validator
      rank
    }
  }
`

const DEFAULT: ActiveValidatorRanksData = {
	activeValidatorRanks: [],
}

export const fetchActiveValidatorRanks = (network: string) =>
	fetchQuery<ActiveValidatorRanksData>(QUERY, { network }, DEFAULT)
