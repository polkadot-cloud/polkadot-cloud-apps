// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { GetNomineesStatusData } from '../types'
import { type FetchQueryOptions, fetchQuery } from './generic'

const QUERY = gql`
  query EraNomineeStatuses($network: String!, $era: Int!, $who: String!, $addresses: [String!]!) {
    getNomineesStatus(network: $network, era: $era, who: $who, addresses: $addresses) {
      statuses { address status activeBacking }
    }
  }
`

const DEFAULT: GetNomineesStatusData = { getNomineesStatus: { statuses: [] } }

export const fetchGetNomineesStatus = (
	network: string,
	era: number,
	who: string,
	addresses: string[],
	options?: FetchQueryOptions,
) =>
	fetchQuery<GetNomineesStatusData>(
		QUERY,
		{ network, era, who, addresses },
		DEFAULT,
		options,
	)
