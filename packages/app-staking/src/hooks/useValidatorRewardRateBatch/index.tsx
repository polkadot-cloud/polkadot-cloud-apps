// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDataResource } from 'data-gate/react'
import { validatorRewardRates } from 'data-gate/resources/performance'

// Compatibility wrapper. APY source and its prerequisites are selected together by data-gate.
export const useValidatorRewardRateBatch = (
	addresses: string[],
	pageKey: string,
	source: 'auto' | 'none' = 'auto',
) => {
	const result = useDataResource(
		validatorRewardRates(addresses, source !== 'none'),
	)
	return {
		rates: {
			[pageKey]: Object.fromEntries(
				(result.data?.validatorAvgRewardRateBatch ?? []).map(
					({ validator, rate }) => [validator, rate],
				),
			),
		},
		loading: result.loading,
		error: result.error,
	}
}
