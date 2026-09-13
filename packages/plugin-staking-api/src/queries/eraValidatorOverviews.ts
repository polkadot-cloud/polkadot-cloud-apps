// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import { type FetchQueryOptions, fetchQuery } from './generic'

export interface EraValidatorOverview {
	validator: string
	own: string
	total: string
	nominatorCount: number
	pageCount: number
}

const QUERY = gql`
  query EraValidatorOverviews($network: String!, $era: Int!, $addresses: [String!]!) {
    eraValidatorOverviews(network: $network, era: $era, addresses: $addresses) {
      validator
      own
      total
      nominatorCount
      pageCount
    }
  }
`

export const fetchEraValidatorOverviews = (
	network: string,
	era: number,
	addresses: string[],
	options?: FetchQueryOptions,
) =>
	fetchQuery<{ eraValidatorOverviews: EraValidatorOverview[] }>(
		QUERY,
		{ network, era, addresses },
		{ eraValidatorOverviews: [] },
		options,
	)

const COUNT_QUERY = gql`
  query EraActiveValidatorCount($network: String!, $era: Int!) {
    eraActiveValidatorCount(network: $network, era: $era)
  }
`

export const fetchEraActiveValidatorCount = (
	network: string,
	era: number,
	options?: FetchQueryOptions,
) =>
	fetchQuery<{ eraActiveValidatorCount: number }>(
		COUNT_QUERY,
		{ network, era },
		{ eraActiveValidatorCount: 0 },
		options,
	)
