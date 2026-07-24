// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getChainRpcEndpoints } from 'consts/util/rpc'
import type { RpcHealthLabels } from 'plugin-staking-api/types'
import type { NetworkId, RpcEndpoints } from 'types'
import { setLocalRpcEndpoints } from './local'

// Gets healthy endpoints for a given chain
export const getChainHealthyEndpoints = (
	chain: string,
	health: RpcHealthLabels | null,
) => health?.chains?.find((c) => c.chain === chain)?.endpoints || []

// Checks if the given chain endpoint is healthy
export const endpointIsHealthy = (
	key: string,
	healthyList: string[],
): boolean => !!healthyList?.find((label) => label === key)

// Sanitizes endpoints, replacing any unhealthy endpoints with a healthy one, or a random default if
// none are available
export const sanitizeEndpoints = (
	network: NetworkId,
	endpoints: RpcEndpoints,
	health: RpcHealthLabels,
): RpcEndpoints => {
	const result: RpcEndpoints = {}

	for (const [chain, rpcKey] of Object.entries(endpoints)) {
		const healthyRpcs = getChainHealthyEndpoints(chain, health)
		const healthy = endpointIsHealthy(rpcKey, healthyRpcs)

		if (healthy) {
			result[chain] = rpcKey
			continue
		}

		// If not healthy, replace with a random healthy provider
		if (healthyRpcs.length > 0) {
			const newRpc = healthyRpcs[Math.floor(healthyRpcs.length * Math.random())]

			// Get rpcKey from the new endpoint
			const newEndpointKey = Object.keys(getChainRpcEndpoints(chain)).find(
				(key) => key === newRpc,
			)
			if (newEndpointKey) {
				result[chain] = newRpc
				continue
			}
		}

		// No healthy endpoints found, use random endpoint from defaults
		const defaultEndpoints = Object.keys(getChainRpcEndpoints(chain))
		result[chain] =
			defaultEndpoints[Math.floor(defaultEndpoints.length * Math.random())]
	}

	// Set sanitized endpoints in local storage
	setLocalRpcEndpoints(network, result)
	return result
}
