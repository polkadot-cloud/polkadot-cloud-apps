// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { skipToken } from '@tanstack/react-query'
import { pluginEnabled } from 'global-bus'
import { fetchValidatorTotalBacking } from 'plugin-staking-api'
import { requestOptions } from './eraStakers/requestOptions'
import { useDataPoint } from './useDataPoint'

export const useValidatorTotalBacking = (validator: string) => {
	const result = useDataPoint<bigint>({
		key: ['validator-total-backing', validator],
		node: { queryFn: skipToken },
		stakingApi: {
			enabled: !!validator,
			refreshInterval: 60_000,
			queryFn: async ({ network, signal }) => {
				const { validatorTotalBacking: backing } =
					await fetchValidatorTotalBacking(
						network,
						validator,
						requestOptions(signal),
					)
				signal.throwIfAborted()
				if (typeof backing !== 'string' || !/^\d+$/.test(backing)) {
					throw new Error(
						'Staking API returned invalid validator total backing',
					)
				}
				return BigInt(backing)
			},
		},
	})
	return {
		...result,
		data: result.data ?? null,
		loading: !!validator && pluginEnabled('staking_api') && result.loading,
	}
}
