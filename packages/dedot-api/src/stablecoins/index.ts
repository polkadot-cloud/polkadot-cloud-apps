// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { DedotClient } from 'dedot'
import type { ServiceInterface, StablecoinBalance } from 'types'
import { createAssetHubStablecoinAdapter } from './assetHub'
import {
	createHydrationStablecoinAdapter,
	type HydrationStablecoinAdapter,
} from './hydration'
import type { StablecoinAdapter } from './shared'

type StablecoinAdapters = {
	statemint: StablecoinAdapter
	hydration: HydrationStablecoinAdapter
}

// Creates the stablecoin service interface for balances, transfers, fee assets, and fee estimates
// across Asset Hub and Hydration.
export const createStablecoinsInterface = (
	apiHub: DedotClient<PolkadotAssetHubApi>,
	getHydrationApi: () => Promise<DedotClient<HydrationApi>>,
): ServiceInterface['stablecoins'] => {
	const adapters: StablecoinAdapters = {
		statemint: createAssetHubStablecoinAdapter(apiHub),
		hydration: createHydrationStablecoinAdapter(getHydrationApi),
	}

	return {
		query: {
			balances: async (address) => {
				const jobs = Object.values(adapters).flatMap((adapter) =>
					adapter.feeAssets.map((symbol) => adapter.balance(address, symbol)),
				)

				const balances = await Promise.all(jobs)
				return balances.filter(
					(balance): balance is StablecoinBalance => !!balance,
				)
			},
			balance: (address, chain, symbol) =>
				adapters[chain].balance(address, symbol),
			hydrationFeeCurrency: (address) =>
				adapters.hydration.hydrationFeeCurrency(address),
		},
		tx: {
			transfer: (input) => adapters[input.chain].transfer(input),
			setHydrationFeeCurrency: (symbol) =>
				adapters.hydration.setHydrationFeeCurrency(symbol),
		},
		fee: {
			paymentOptions: (chain, symbol) => adapters[chain].paymentOptions(symbol),
			estimate: (input) => adapters[input.chain].estimateFee(input),
		},
	}
}
