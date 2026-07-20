// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	extractUrlValue,
	localStorageOrDefault,
	withTimeout,
} from '@w3ux/utils'
import { AutoRpcKey, NetworkKey, ProviderTypeKey, rpcEndpointKey } from 'consts'
import { DefaultNetwork, NetworkList, SystemChainList } from 'consts/networks'
import { getDefaultRpcEndpoints, getEnabledNetworks } from 'consts/util'
import { fetchRpcEndpointHealth } from 'plugin-staking-api'
import type {
	RpcEndpointHealthData,
	RpcHealthLabels,
} from 'plugin-staking-api/types'
import type {
	NetworkConfig,
	NetworkId,
	ProviderType,
	RpcEndpoints,
} from 'types'
import { pluginEnabled } from '../plugins'
import { sanitizeEndpoints } from './health'
import { getLocalRpcHealthCache, setLocalRpcHealthCache } from './local'

export const getInitialNetwork = () => {
	// Attempt to get network from URL
	const urlNetwork = extractUrlValue('n')
	const urlNetworkValid = !!Object.values(getEnabledNetworks()).find(
		(n) => n.name === urlNetwork,
	)

	// Use network from url if valid
	if (urlNetworkValid) {
		localStorage.setItem(NetworkKey, urlNetwork || '')
		return urlNetwork as NetworkId
	}

	// Fallback 1: Use network from local storage if valid
	const localNetwork: NetworkId = localStorage.getItem(NetworkKey) as NetworkId
	const localNetworkValid = !!Object.values(getEnabledNetworks()).find(
		(n) => n.name === localNetwork,
	)
	if (localNetworkValid) {
		localStorage.setItem(NetworkKey, localNetwork)
		return localNetwork
	}

	// Fallback 2: Use default network
	localStorage.setItem(NetworkKey, DefaultNetwork)
	return DefaultNetwork
}

export const getInitialRpcEndpoints = async (
	network: NetworkId,
): Promise<RpcEndpoints> => {
	// Validates local RPC endpoints by checking against the default values
	const validateRpcEndpoints = (a: object, b: object) => {
		const typeCheck =
			JSON.stringify(Object.keys(a).sort()) ===
				JSON.stringify(Object.keys(b).sort()) &&
			Object.values(a).every((v) => typeof v === 'string') &&
			Object.values(b).every((v) => typeof v === 'string')

		// Check if values are valid RPC keys
		const allChains = { ...NetworkList, ...SystemChainList }
		const valueCheck = Object.entries(a).every(([k, v]) =>
			Object.keys(allChains[k]?.endpoints?.rpc || []).includes(v),
		)
		return typeCheck && valueCheck
	}

	// Get the local and fallback RPC endpoints
	const local = localStorageOrDefault<RpcEndpoints>(
		rpcEndpointKey(network),
		{},
		true,
	) as RpcEndpoints
	const fallback = getDefaultRpcEndpoints(network)

	// If staking API is enabled, fetch health of RPC endpoints
	let healthResult: RpcHealthLabels = { chains: [] }

	const stakingApiEnabled = pluginEnabled('staking_api')
	if (stakingApiEnabled) {
		// Try to get cached health data first
		const cachedHealth = getLocalRpcHealthCache(network)

		if (cachedHealth) {
			// Use cached data if available and fresh
			healthResult = cachedHealth
		} else {
			// Fetch fresh data from API if cache is stale or missing
			const result = (await withTimeout(
				2000,
				fetchRpcEndpointHealth(network),
			)) as RpcEndpointHealthData | undefined

			// Cache the fresh data if it was successfully fetched
			if (result && result.rpcEndpointHealth.chains.length > 0) {
				// Format result to only include endpoint labels
				const healthLabels: RpcHealthLabels = {
					chains: result.rpcEndpointHealth.chains.map((chain) => ({
						...chain,
						endpoints: chain.endpoints.map((endpoint) => endpoint.label),
					})),
				}
				healthResult = healthLabels
				setLocalRpcHealthCache(network, healthLabels)
			}
		}
	}

	// Return sanitized local endpoints if valid
	if (local) {
		if (validateRpcEndpoints(local, fallback)) {
			return stakingApiEnabled
				? sanitizeEndpoints(network, local, healthResult)
				: local
		}
	}
	// Return sanitized fallback endpoints
	return stakingApiEnabled
		? sanitizeEndpoints(network, fallback, healthResult)
		: fallback
}

export const getInitialProviderType = (): ProviderType => {
	const result = localStorage.getItem(ProviderTypeKey) || 'ws'
	if (['ws', 'sc'].includes(result)) {
		return result as ProviderType
	}
	return 'ws'
}

export const getInitialAutoRpc = (): boolean => {
	const result = localStorage.getItem(AutoRpcKey)
	// Default to true if not set
	if (result === null) {
		return true
	}
	return result === 'true'
}

export const getInitialNetworkConfig = async (): Promise<NetworkConfig> => {
	const network = getInitialNetwork()
	const rpcEndpoints = await getInitialRpcEndpoints(network)
	const providerType = getInitialProviderType()
	const autoRpc = getInitialAutoRpc()
	return {
		network,
		rpcEndpoints,
		providerType,
		autoRpc,
	}
}
