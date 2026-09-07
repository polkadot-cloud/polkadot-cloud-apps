// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { OPERATOR_LIST_QUERY, OPERATOR_STATS_QUERY } from 'plugin-staking-api'
import type {
	OperatorListData,
	OperatorListVariables,
	OperatorStatsData,
} from 'plugin-staking-api/types'
import { apiResource } from '../sources/apiResource'

export const operatorList = (
	variables: Omit<OperatorListVariables, 'network'>,
	enabled = true,
) =>
	apiResource<OperatorListData>(
		'operators',
		'list',
		OPERATOR_LIST_QUERY,
		variables,
		enabled,
	)
export const operatorStats = (enabled = true) =>
	apiResource<OperatorStatsData>(
		'operators',
		'stats',
		OPERATOR_STATS_QUERY,
		{},
		enabled,
	)
