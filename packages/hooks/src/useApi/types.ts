// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ActiveEra,
	ApiStatus,
	ChainConsts,
	ChainId,
	ChainSpec,
	PoolsConfig,
	ProviderType,
	ServiceInterface,
} from 'types'

export interface ApiHookInterface {
	getRpcEndpoint: (chain: ChainId) => string
	getApiStatus: (id: ChainId) => ApiStatus
	getChainSpec: (chain: ChainId) => ChainSpec
	getConsts: (chain: ChainId) => ChainConsts
	isReady: boolean
	providerType: ProviderType
	autoRpc: boolean
	activeEra: ActiveEra
	poolsConfig: PoolsConfig
	serviceApi: ServiceInterface
}
