// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { GetNomineesInEraData, QueryReturn } from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
  query GetNomineesInEra($network: String!, $era: Int!, $who: String!) {
    getNomineesInEra(network: $network, era: $era, who: $who)
  }
`

const DEFAULT: GetNomineesInEraData = {
	getNomineesInEra: [],
}

export const useNomineesInEra = ({
	network,
	era,
	who,
	skip,
}: {
	network: string
	era: number
	who: string
	skip?: boolean
}): QueryReturn<GetNomineesInEraData> =>
	useApiQuery<GetNomineesInEraData>(QUERY, { network, era, who }, DEFAULT, {
		skip,
	})
