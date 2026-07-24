// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	ActiveStatusWithNominees,
	GetActiveStakerWithNomineesData,
} from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query GetStakerWithNominees($network: String!, $era: Int!, $who: String!, $addresses: [String!]!) {
  getNomineesStatus(network: $network, era: $era, who: $who, addresses: $addresses) {
    statuses {
      address
      status
    }
  }
  isActiveStaker(network: $network, address: $who) {
    active
  }
}
`

const DEFAULT_DATA: GetActiveStakerWithNomineesData = {
	isActiveStaker: { active: false },
	getNomineesStatus: { statuses: [] },
}

export const fetchGetStakerWithNominees = async (
	network: string,
	era: number,
	who: string,
	addresses: string[],
): Promise<ActiveStatusWithNominees> => {
	const data = await fetchQuery<GetActiveStakerWithNomineesData>(
		QUERY,
		{ network, era, who, addresses },
		DEFAULT_DATA,
	)
	return {
		active: data.isActiveStaker.active,
		statuses: data.getNomineesStatus.statuses,
	}
}
