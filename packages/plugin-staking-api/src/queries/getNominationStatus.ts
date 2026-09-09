// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { GetNominationStatusData, StakerNominationStatus } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query GetNominationStatus($network: String!, $who: String!) {
    getNominationStatus(network: $network, who: $who) {
      status
    }
  }
`

const DEFAULT_DATA: GetNominationStatusData = {
	getNominationStatus: { status: 'waiting' },
}

export const fetchGetNominationStatus = async (
	network: string,
	who: string,
	signal?: AbortSignal,
): Promise<StakerNominationStatus> => {
	const data = await fetchQuery<GetNominationStatusData>(
		QUERY,
		{ network, who },
		DEFAULT_DATA,
		{
			throwOnError: true,
			fetchPolicy: 'network-only',
			context: { fetchOptions: { signal } },
		},
	)
	const status = data.getNominationStatus?.status
	if (status !== 'active' && status !== 'inactive' && status !== 'waiting') {
		throw new Error('Staking API returned an invalid nomination status')
	}
	return status
}
