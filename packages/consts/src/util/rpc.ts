// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId } from 'types'
import { NetworkList, SystemChainList } from '../networks'

// Get default rpc endpoints for a relay chain and accompanying system chains for a given network
export const getDefaultRpcEndpoints = (network: NetworkId) => {
	const relayRpcs = NetworkList[network].endpoints.rpc
	const systemChains = Object.entries(SystemChainList).filter(
		([, c]) => c.relayChain === network,
	)
	// Take a random rpc endpoint for the relay chain
	const relayRpc =
		Object.keys(relayRpcs)[
			Math.floor(Math.random() * Object.keys(relayRpcs).length)
		]
	const systemChainRpc = systemChains.reduce(
		(acc: Record<string, string>, [id, c]) => {
			const rpc = Object.keys(c.endpoints.rpc)[
				Math.floor(Math.random() * Object.keys(c.endpoints.rpc).length)
			]
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

// Gets the RPC endpoints for a given chain
export const getChainRpcEndpoints = (chain: string): Record<string, string> =>
	(NetworkList[chain] || SystemChainList[chain])?.endpoints?.rpc || {}
