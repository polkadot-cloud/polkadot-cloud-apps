// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	activeEra$,
	apiStatus$,
	chainSpecs$,
	consts$,
	defaultActiveEra,
	defaultChainSpecs,
	defaultConsts,
	defaultPoolsConfig,
	defaultServiceInterface,
	getAutoRpc,
	getProviderType,
	getRpcEndpoints,
	networkConfig$,
	poolsConfig$,
	serviceInterface$,
} from 'global-bus'
import { useCallback, useSyncExternalStore } from 'react'
import type {
	ApiStatus,
	ChainConsts,
	ChainId,
	ChainSpec,
	ActiveEra as IActiveEra,
	PoolsConfig,
	ProviderType,
	ServiceInterface,
} from 'types'
import { createObservableStore } from 'utils'
import { useNetwork } from '../useNetwork'
import type { ApiHookInterface } from './types'

export type { ApiHookInterface } from './types'

const providerTypeStore = createObservableStore<ProviderType>(
	networkConfig$,
	getProviderType,
)
const autoRpcStore = createObservableStore<boolean>(networkConfig$, getAutoRpc)
const apiStatusStore = createObservableStore<Record<string, ApiStatus>>(
	apiStatus$,
	{},
)
const chainSpecsStore = createObservableStore<Record<string, ChainSpec>>(
	chainSpecs$,
	{},
)
const constsStore = createObservableStore<Record<string, ChainConsts>>(
	consts$,
	{},
)
const activeEraStore = createObservableStore<IActiveEra>(
	activeEra$,
	defaultActiveEra,
)
const poolsConfigStore = createObservableStore<PoolsConfig>(
	poolsConfig$,
	defaultPoolsConfig,
)
const serviceInterfaceStore = createObservableStore<ServiceInterface>(
	serviceInterface$,
	defaultServiceInterface,
)

export const useApi = (): ApiHookInterface => {
	const { network } = useNetwork()
	const providerType = useSyncExternalStore(
		providerTypeStore.subscribe,
		providerTypeStore.getSnapshot,
		providerTypeStore.getSnapshot,
	)
	const autoRpc = useSyncExternalStore(
		autoRpcStore.subscribe,
		autoRpcStore.getSnapshot,
		autoRpcStore.getSnapshot,
	)
	const apiStatus = useSyncExternalStore(
		apiStatusStore.subscribe,
		apiStatusStore.getSnapshot,
		apiStatusStore.getSnapshot,
	)
	const chainSpecs = useSyncExternalStore(
		chainSpecsStore.subscribe,
		chainSpecsStore.getSnapshot,
		chainSpecsStore.getSnapshot,
	)
	const consts = useSyncExternalStore(
		constsStore.subscribe,
		constsStore.getSnapshot,
		constsStore.getSnapshot,
	)
	const activeEra = useSyncExternalStore(
		activeEraStore.subscribe,
		activeEraStore.getSnapshot,
		activeEraStore.getSnapshot,
	)
	const poolsConfig = useSyncExternalStore(
		poolsConfigStore.subscribe,
		poolsConfigStore.getSnapshot,
		poolsConfigStore.getSnapshot,
	)
	const serviceApi = useSyncExternalStore(
		serviceInterfaceStore.subscribe,
		serviceInterfaceStore.getSnapshot,
		serviceInterfaceStore.getSnapshot,
	)

	const getApiStatus = useCallback(
		(id: ChainId) => apiStatus[id] || 'disconnected',
		[apiStatus],
	)
	const getChainSpec = useCallback(
		(chain: ChainId): ChainSpec => chainSpecs[chain] || defaultChainSpecs,
		[chainSpecs],
	)
	const getConsts = useCallback(
		(chain: ChainId): ChainConsts => {
			const chainConsts = consts[chain] || defaultConsts
			if (chain !== 'polkadot') {
				return chainConsts
			}

			return {
				...chainConsts,
				bondDuration: chainConsts.nominatorFastUnbondDuration,
			}
		},
		[consts],
	)
	const getRpcEndpoint = useCallback((chain: ChainId): string => {
		const endpoints = getRpcEndpoints()
		return endpoints[chain]
	}, [])

	return {
		getApiStatus,
		getChainSpec,
		providerType,
		autoRpc,
		getRpcEndpoint,
		isReady: getApiStatus(network) === 'ready',
		getConsts,
		activeEra,
		poolsConfig,
		serviceApi,
	}
}
