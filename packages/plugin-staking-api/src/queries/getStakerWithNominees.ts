// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	ActiveStatusWithNominees,
	GetActiveStakerWithNomineesData,
} from '../types'
import { fetchQuery } from './generic'

export const GET_STAKER_WITH_NOMINEES_QUERY = gql`
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

// Status-only consumers should not wait for the independent active-staker resolver.
export const GET_NOMINEES_STATUS_QUERY = gql`
 query GetNomineesStatus($network: String!, $era: Int!, $who: String!, $addresses: [String!]!) {
 getNomineesStatus(network: $network, era: $era, who: $who, addresses: $addresses) {
 statuses { address status }
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
		GET_STAKER_WITH_NOMINEES_QUERY,
		{ network, era, who, addresses },
		DEFAULT_DATA,
	)
	return {
		active: data.isActiveStaker.active,
		statuses: data.getNomineesStatus.statuses,
	}
}
