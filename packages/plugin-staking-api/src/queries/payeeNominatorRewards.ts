// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PayeeNominatorRewardsData, QueryReturn } from '../types'
import { fetchQuery, useApiQuery } from './generic'

const QUERY = gql`
  query PayeeNominatorRewards(
    $network: String!
    $payee: String!
    $days: Int
    $fromEra: Int
  ) {
    payeeNominatorRewards(
      network: $network
      payee: $payee
      days: $days
      fromEra: $fromEra
    ) {
      total
      rewards {
        era
        reward
      }
      active {
        address
        label
        stakedBalance
        validatorApy
        incomingPayouts
      }
    }
  }
`

const DEFAULT: PayeeNominatorRewardsData = {
	payeeNominatorRewards: {
		total: '0',
		rewards: [],
		active: [],
	},
}

export const usePayeeNominatorRewards = ({
	network,
	payee,
	days,
	fromEra,
	skip,
}: {
	network: string
	payee: string
	days?: number
	fromEra?: number
	skip?: boolean
}): QueryReturn<PayeeNominatorRewardsData> =>
	useApiQuery<PayeeNominatorRewardsData>(
		QUERY,
		{ network, payee, days, fromEra },
		DEFAULT,
		{ skip },
	)

export const fetchPayeeNominatorRewards = (
	network: string,
	payee: string,
	days?: number,
	fromEra?: number,
) =>
	fetchQuery<PayeeNominatorRewardsData>(
		QUERY,
		{ network, payee, days, fromEra },
		DEFAULT,
	)
