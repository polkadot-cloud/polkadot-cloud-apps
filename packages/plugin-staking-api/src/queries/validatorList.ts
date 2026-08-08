// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	QueryReturn,
	ValidatorListData,
	ValidatorListVariables,
} from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
  query ValidatorList(
    $network: String!
    $page: Int
    $pageSize: Int
    $order: ValidatorListOrder
    $filters: ValidatorListFilters
  ) {
    validatorList(
      network: $network
      page: $page
      pageSize: $pageSize
      order: $order
      filters: $filters
    ) {
      validators {
        address
        prefs {
          commission
          blocked
        }
        identity {
          display
          superDisplay
          superValue
        }
        active
        selfStake
        totalStake
        activityRank
        retainment {
          fromTimestamp
          netInflow
          retainmentRate
          selfStakeChange
          compoundRate
        }
      }
      page
      pageSize
      total
      totalPages
      hasNextPage
      activityEra
      totalActive
    }
  }
`

const DEFAULT: ValidatorListData = {
	validatorList: {
		validators: [],
		page: 1,
		pageSize: 50,
		total: 0,
		totalPages: 0,
		hasNextPage: false,
		activityEra: null,
		totalActive: 0,
	},
}

export const useValidatorList = (
	variables: ValidatorListVariables,
	options?: { skip?: boolean },
): QueryReturn<ValidatorListData> =>
	useApiQuery<ValidatorListData>(QUERY, variables, DEFAULT, options)
