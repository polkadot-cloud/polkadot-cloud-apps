// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { DedotClient } from 'dedot'
import {
	getStablecoinBalances,
	setStablecoinBalances,
	setStablecoinBalancesError,
	setStablecoinBalancesSyncing,
} from 'global-bus'
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

type BalanceRequest = {
	promise: Promise<StablecoinBalance[]>
	requestId: number
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
	const balanceRequests = new Map<string, BalanceRequest>()

	const queryBalances = (address: string): Promise<StablecoinBalance[]> => {
		const pending = balanceRequests.get(address)
		const state = getStablecoinBalances(address)
		if (
			pending &&
			state.status === 'syncing' &&
			state.requestId === pending.requestId
		) {
			return pending.promise
		}

		const requestId = setStablecoinBalancesSyncing(address)
		const promise = Promise.all(
			Object.values(adapters).flatMap((adapter) =>
				adapter.feeAssets.map((symbol) => adapter.balance(address, symbol)),
			),
		)
			.then((results) => {
				const balances = results.filter(
					(balance): balance is StablecoinBalance => !!balance,
				)
				setStablecoinBalances(address, balances, requestId)
				return balances
			})
			.catch((error) => {
				setStablecoinBalancesError(address, requestId)
				throw error
			})
			.finally(() => {
				if (balanceRequests.get(address)?.requestId === requestId) {
					balanceRequests.delete(address)
				}
			})

		balanceRequests.set(address, { promise, requestId })
		return promise
	}

	return {
		query: {
			balances: queryBalances,
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
