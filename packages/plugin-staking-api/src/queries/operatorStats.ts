// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	OperatorStatsData,
	OperatorStatsVariables,
	QueryReturn,
} from '../types'
import { useApiQuery } from './generic'

export const OPERATOR_STATS_QUERY = gql`
  query OperatorStats($network: String!) {
    operatorStats(network: $network) {
      totalOperators
      activeOperators
      operatorValidatorCoverage
    }
  }
`

export const OPERATOR_STATS_DEFAULT: OperatorStatsData = {
	operatorStats: {
		totalOperators: 0,
		activeOperators: 0,
		operatorValidatorCoverage: 0,
	},
}

export const useOperatorStats = (
	variables: OperatorStatsVariables,
	options?: { skip?: boolean },
): QueryReturn<OperatorStatsData> =>
	useApiQuery<OperatorStatsData>(
		OPERATOR_STATS_QUERY,
		variables,
		OPERATOR_STATS_DEFAULT,
		options,
	)
