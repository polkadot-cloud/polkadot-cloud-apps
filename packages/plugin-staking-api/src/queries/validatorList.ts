// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	QueryReturn,
	ValidatorListData,
	ValidatorListVariables,
} from '../types'
import { fetchQuery, useApiQuery } from './generic'

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
          address
          display
          superDisplay
          superValue
          category
        }
        active
        selfStake
        totalStake
        activeLedger
        totalLedger
        activityRank
        retainment {
          month
          year
          fromEra
          toEra
          fromTimestamp
          toTimestamp
          graphRewards
          netInflow
          retained
          retainmentRate
          validatorRewards
          selfStakeChange
          compounded
          compoundRate
        }
      }
      page
      pageSize
      total
      totalPages
      hasNextPage
      activityEra
      retainmentEra
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
		retainmentEra: null,
		totalActive: 0,
	},
}

export const useValidatorList = (
	variables: ValidatorListVariables,
	options?: { skip?: boolean },
): QueryReturn<ValidatorListData> =>
	useApiQuery<ValidatorListData>(QUERY, variables, DEFAULT, options)

export const fetchValidatorList = (variables: ValidatorListVariables) =>
	fetchQuery<ValidatorListData>(QUERY, variables, DEFAULT)
