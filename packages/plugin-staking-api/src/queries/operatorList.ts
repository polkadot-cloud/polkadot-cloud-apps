// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	OperatorListData,
	OperatorListVariables,
	QueryReturn,
} from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
  query OperatorList(
    $network: String!
    $page: Int
    $pageSize: Int
    $order: OperatorListOrder
    $filters: OperatorListFilters
  ) {
    operatorList(
      network: $network
      page: $page
      pageSize: $pageSize
      order: $order
      filters: $filters
    ) {
      operators {
        identity {
          address
          display
        }
        validators
        validatorCount
        activeValidatorCount
        combinedSelfStake
        retainment {
          retainmentRate
        }
      }
      page
      pageSize
      total
      totalPages
      hasNextPage
    }
  }
`

const DEFAULT: OperatorListData = {
	operatorList: {
		operators: [],
		page: 1,
		pageSize: 50,
		total: 0,
		totalPages: 0,
		hasNextPage: false,
	},
}

export const useOperatorList = (
	variables: OperatorListVariables,
	options?: { skip?: boolean },
): QueryReturn<OperatorListData> =>
	useApiQuery<OperatorListData>(QUERY, variables, DEFAULT, options)
