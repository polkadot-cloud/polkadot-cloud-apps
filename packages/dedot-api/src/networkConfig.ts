// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SystemChainList } from 'consts/networks'
import type { NetworkConfig } from 'types'

// Cloud endpoints are present only when production access or the authenticated dev proxy is
// enabled.
export const resolveServiceNetworkConfig = (
	config: NetworkConfig,
	forceCloudRpc: boolean,
): NetworkConfig => {
	if (!forceCloudRpc) return config
	const cloudEndpoints = Object.fromEntries(
		Object.entries(SystemChainList)
			.filter(
				([, chain]) =>
					chain.relayChain === config.network &&
					!!chain.endpoints.rpc['Polkadot Cloud'],
			)
			.map(([id]) => [id, 'Polkadot Cloud']),
	)
	if (!Object.keys(cloudEndpoints).length) return config
	return {
		...config,
		rpcEndpoints: { ...config.rpcEndpoints, ...cloudEndpoints },
		providerType: 'ws',
		autoRpc: false,
	}
}
