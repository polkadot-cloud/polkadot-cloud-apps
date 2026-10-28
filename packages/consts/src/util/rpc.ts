// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainId, NetworkId, RpcEndpoints } from 'types'
import { NetworkList, SystemChainList } from '../networks'
import { DefaultRpcProviderByChain } from '../rpc'

const getDefaultRpcProvider = (chain: ChainId, providers: RpcEndpoints) => {
	const preferredProvider = DefaultRpcProviderByChain[chain]
	const providerNames = Object.keys(providers)

	if (preferredProvider && providerNames.includes(preferredProvider)) {
		return preferredProvider
	}

	return providerNames[Math.floor(Math.random() * providerNames.length)]
}

// Get default rpc endpoints for a relay chain and accompanying system chains for a given network
export const getDefaultRpcEndpoints = (network: NetworkId) => {
	const relayRpcs = NetworkList[network].endpoints.rpc
	const systemChains = Object.entries(SystemChainList).filter(
		([, c]) => c.relayChain === network,
	)
	const relayRpc = getDefaultRpcProvider(network, relayRpcs)
	const systemChainRpc = systemChains.reduce(
		(acc: Record<string, string>, [id, c]) => {
			const rpc = getDefaultRpcProvider(id as ChainId, c.endpoints.rpc)
			acc[id] = rpc
			return acc
		},
		{},
	)

	return {
		[network]: relayRpc,
		...systemChainRpc,
	}
}
