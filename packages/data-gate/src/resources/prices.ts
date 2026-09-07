// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { TOKEN_PRICE_QUERY } from 'plugin-staking-api'
import type { TokenPriceData } from 'plugin-staking-api/types'
import { queryStakingApi } from '../sources/stakingApi'
import type { ResourceDefinition } from '../types'

export const tokenPrice = (
	ticker: string,
): ResourceDefinition<TokenPriceData['tokenPrice']> => ({
	name: 'tokenPrice',
	key: [ticker],
	enabled: !!ticker,
	refreshIntervalMs: 30_000,
	load: async ({ signal }) =>
		(
			await queryStakingApi<TokenPriceData>(
				TOKEN_PRICE_QUERY,
				{ ticker },
				signal,
			)
		).tokenPrice,
})
