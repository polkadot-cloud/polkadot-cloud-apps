// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { PolkadotPeopleApi } from '@dedot/chaintypes/polkadot-people'
import type { DedotClient } from 'dedot'
import {
	getStablecoinBalances,
	setStablecoinBalances,
	setStablecoinBalancesError,
	setStablecoinBalancesSyncing,
} from 'global-bus'
import type { ServiceInterface, StablecoinBalance } from 'types'
import type { DedotServiceFeatures } from '../types'
import { createAssetHubStablecoinAdapter } from './assetHub'
import {
	createHydrationStablecoinAdapter,
	type HydrationStablecoinAdapter,
} from './hydration'
import { createPeopleStablecoinAdapter } from './people'
import type { StablecoinAdapter } from './shared'
import { createStablecoinSubscriptions } from './subscriptions'

type StablecoinAdapters = {
	statemint: StablecoinAdapter
	hydration: HydrationStablecoinAdapter
	'people-polkadot': StablecoinAdapter
}

type BalanceRequest = {
	promise: Promise<StablecoinBalance[]>
	requestId: number
}

// Creates the stablecoin service interface for balances, transfers, fee assets, and fee estimates
// across the supported transfer chains.
export const createStablecoinsInterface = (
	apiHub: DedotClient<PolkadotAssetHubApi>,
	getHydrationApi: () => Promise<DedotClient<HydrationApi>>,
	getPeopleApi: () => Promise<DedotClient<PolkadotPeopleApi>>,
	features: DedotServiceFeatures['stablecoins'],
): ServiceInterface['stablecoins'] => {
	const adapters: Partial<StablecoinAdapters> = {
		...(features.assetHub && {
			statemint: createAssetHubStablecoinAdapter(apiHub),
		}),
		...(features.hydration && {
			hydration: createHydrationStablecoinAdapter(getHydrationApi),
		}),
		...(features.people && {
			'people-polkadot': createPeopleStablecoinAdapter(getPeopleApi),
		}),
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
		subscribe: createStablecoinSubscriptions(adapters),
		...(features.assetHub &&
			(features.hydration || features.people) && {
				xcm: {
					prepare: async (input) => {
						if (!adapters[input.from] || !adapters[input.to]) {
							throw new Error(
								'Cross-chain transfers unavailable for these chains',
							)
						}
						const { prepareCrossChainTransfer } = await import('../xcm')
						const chains = [input.from, input.to]
						return prepareCrossChainTransfer(
							{
								statemint: apiHub,
								hydration: chains.includes('hydration')
									? await getHydrationApi()
									: undefined,
								'people-polkadot': chains.includes('people-polkadot')
									? await getPeopleApi()
									: undefined,
							},
							input,
						)
					},
				},
			}),
		query: {
			balances: queryBalances,
			balance: async (address, chain, symbol) =>
				adapters[chain]?.balance(address, symbol),
			hydrationFeeCurrency: (address) =>
				adapters.hydration?.hydrationFeeCurrency(address) ??
				Promise.resolve(undefined),
		},
		tx: {
			transfer: async (input) => adapters[input.chain]?.transfer(input),
			setHydrationFeeCurrency: (symbol) =>
				adapters.hydration?.setHydrationFeeCurrency(symbol) ??
				Promise.resolve(undefined),
		},
		fee: {
			paymentOptions: (chain, symbol) =>
				adapters[chain]?.paymentOptions(symbol),
			estimate: (input) =>
				adapters[input.chain]?.estimateFee(input) ?? Promise.resolve(0n),
		},
	}
}
