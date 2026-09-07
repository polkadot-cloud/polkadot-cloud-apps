// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	OperatorListData,
	OperatorListVariables,
	QueryReturn,
} from '../types'
import { OPERATOR_RETAINMENT_FIELDS } from './fragments/retainment'
import { useApiQuery } from './generic'

export const OPERATOR_LIST_QUERY = gql`
  ${OPERATOR_RETAINMENT_FIELDS}
  query OperatorList(
    $network: String!
    $page: Int
    $pageSize: Int
    $order: OperatorListOrder
    $orderWindow: RetainmentRankWindow
    $retainmentWindows: [RetainmentRankWindow!]
    $filters: OperatorListFilters
  ) {
    operatorList(
      network: $network
      page: $page
      pageSize: $pageSize
      order: $order
      orderWindow: $orderWindow
      retainmentWindows: $retainmentWindows
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
        retainRank1m
        retainRank3m
        retainment { ...OperatorRetainmentFields }
      }
      page
      pageSize
      total
      totalPages
      hasNextPage
    }
  }
`

export const OPERATOR_LIST_DEFAULT: OperatorListData = {
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
	useApiQuery<OperatorListData>(
		OPERATOR_LIST_QUERY,
		variables,
		OPERATOR_LIST_DEFAULT,
		options,
	)
