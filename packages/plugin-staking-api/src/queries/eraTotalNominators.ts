// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { EraTotalNominatorsData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query EraTotalNominators($network: String!, $era: Int!) {
    eraTotalNominators(network: $network, era: $era) {
      totalNominators
    }
  }
`

const DEFAULT: EraTotalNominatorsData = {
	eraTotalNominators: {
		totalNominators: 0,
	},
}

export const fetchEraTotalNominators = (network: string, era: number) =>
	fetchQuery<EraTotalNominatorsData>(QUERY, { network, era }, DEFAULT)
