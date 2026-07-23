// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStablecoinBalances, setStablecoinBalancesSyncing } from 'global-bus'
import type { ServiceInterface } from 'types'

// Creates an empty stablecoin interface for networks without stablecoin support.
export const createEmptyStablecoinsInterface =
	(): ServiceInterface['stablecoins'] => ({
		query: {
			balances: async (address) => {
				const requestId = setStablecoinBalancesSyncing(address)
				setStablecoinBalances(address, [], requestId)
				return []
			},
			balance: async () => undefined,
			hydrationFeeCurrency: async () => undefined,
		},
		tx: {
			transfer: async () => undefined,
			setHydrationFeeCurrency: async () => undefined,
		},
		fee: {
			paymentOptions: () => undefined,
			estimate: async () => 0n,
		},
	})
