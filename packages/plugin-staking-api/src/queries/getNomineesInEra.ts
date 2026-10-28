// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { GetNomineesInEraData } from '../types'
import { type FetchQueryOptions, fetchQuery } from './generic'

const QUERY = gql`
  query EraBackedNominees($network: String!, $era: Int!, $who: String!) {
    getNomineesInEra(network: $network, era: $era, who: $who)
  }
`

const DEFAULT: GetNomineesInEraData = { getNomineesInEra: [] }

export const fetchGetNomineesInEra = (
	network: string,
	era: number,
	who: string,
	options?: FetchQueryOptions,
) =>
	fetchQuery<GetNomineesInEraData>(
		QUERY,
		{ network, era, who },
		DEFAULT,
		options,
	)
