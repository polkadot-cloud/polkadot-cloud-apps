// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createProxiesLifecycle } from '@polkadot-cloud/connect-proxies'
import {
	networkConfig$,
	setNetworkConfig,
	setServiceInterface,
} from 'global-bus'
import { getInitialNetworkConfig } from 'global-bus/util'
import { pairwise, startWith } from 'rxjs'
import { onNetworkReset } from './reset'
import { getDefaultService } from './start'
import type { DedotServiceConfig, ServiceClass } from './types'
import { hasApiHub } from './util'

// The active service
let service: ServiceClass

// Handles proxies discovery subscriptions for the active asset hub api and network.
const proxiesLifecycle = createProxiesLifecycle()

// Start service for the current network
export const initDedotService = async (features: DedotServiceConfig = {}) => {
	// Populate network config with sanitized RPC endpoints
	const config = await getInitialNetworkConfig()
	setNetworkConfig(
		config.network,
		config.rpcEndpoints,
		config.providerType,
		config.autoRpc,
	)

	// Subscribe to network config changes
	networkConfig$
		.pipe(startWith(config), pairwise())
		.subscribe(async ([prev, cur]) => {
			// Unsubscribe from previous service if on new network config, and clear stale global state
			if (
				prev.network !== cur.network ||
				prev.providerType !== cur.providerType ||
				prev.autoRpc !== cur.autoRpc
			) {
				proxiesLifecycle.dispose()
				await service?.unsubscribe()
				onNetworkReset()
			}

			const { network, ...rest } = cur
			// Type narrow services and apis
			if (network === 'westend') {
				const { Service, apis, ids, providerRelay, providerPeople } =
					await getDefaultService(network, rest)
				service = new Service(
					cur,
					ids,
					...apis,
					providerRelay,
					providerPeople,
					features,
				)
			}
			if (network === 'kusama') {
				const { Service, apis, ids, providerRelay, providerPeople } =
					await getDefaultService(network, rest)
				service = new Service(
					cur,
					ids,
					...apis,
					providerRelay,
					providerPeople,
					features,
				)
			}
			if (network === 'polkadot') {
				const { Service, apis, ids, providerRelay, providerPeople } =
					await getDefaultService(network, rest)
				service = new Service(
					cur,
					ids,
					...apis,
					providerRelay,
					providerPeople,
					features,
				)
			}
			if (network === 'paseo') {
				const { Service, apis, ids, providerRelay, providerPeople } =
					await getDefaultService(network, rest)
				service = new Service(
					cur,
					ids,
					...apis,
					providerRelay,
					providerPeople,
					features,
				)
			}

			// Expose service interface
			setServiceInterface(service.interface)

			if (hasApiHub(service)) {
				proxiesLifecycle.update(service.apiHub, network)
			}

			// Start the service
			await service.start()
		})
}

export type { DedotServiceConfig } from './types'
