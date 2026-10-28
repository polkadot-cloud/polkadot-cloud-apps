// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { EraActiveNominatorCountData } from '../types'
import { type FetchQueryOptions, fetchQuery } from './generic'

const QUERY = gql`
  query EraActiveNominatorCount($network: String!, $era: Int!) {
    eraActiveNominatorCount(network: $network, era: $era)
  }
`

const DEFAULT: EraActiveNominatorCountData = { eraActiveNominatorCount: 0 }

export const fetchEraActiveNominatorCount = (
	network: string,
	era: number,
	options?: FetchQueryOptions,
) =>
	fetchQuery<EraActiveNominatorCountData>(
		QUERY,
		{ network, era },
		DEFAULT,
		options,
	)
