// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { GetNominationStatusData, StakerNominationStatus } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query GetNominationStatus($network: String!, $who: String!) {
    getNominationStatus(network: $network, who: $who)
  }
`

const DEFAULT_DATA: GetNominationStatusData = {
	getNominationStatus: 'waiting',
}

export const fetchGetNominationStatus = async (
	network: string,
	who: string,
): Promise<StakerNominationStatus> => {
	const data = await fetchQuery<GetNominationStatusData>(
		QUERY,
		{ network, who },
		DEFAULT_DATA,
	)
	return data.getNominationStatus
}
