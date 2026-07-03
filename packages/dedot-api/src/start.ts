// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getHubChainId,
	getPeopleChainId,
	getRelayChainData,
	getSystemChainData,
} from 'consts/util'
import { DedotClient, WsProvider } from 'dedot'
import { setMultiApiStatus } from 'global-bus'
import type {
	DefaultServiceNetworkId,
	NetworkConfig,
	NetworkId,
	SystemChainId,
} from 'types'
import type { DefaultService } from './defaultService/types'
import { Services } from './services'
import {
	newRelayChainSmProvider,
	newSystemChainSmProvider,
} from './smoldot/providers'
import type { Service } from './types'

// Determines service class and apis for a network
export const getDefaultService = async <T extends DefaultServiceNetworkId>(
	network: T,
	{ rpcEndpoints, providerType, autoRpc }: Omit<NetworkConfig, 'network'>,
): Promise<DefaultService<T>> => {
	const peopleChainId = getPeopleChainId(network) as SystemChainId
	const hubChainId = getHubChainId(network) as SystemChainId

	const relayData = getRelayChainData(network)
	const peopleData = getSystemChainData(peopleChainId)
	const hubData = getSystemChainData(hubChainId)

	const ids = [network, peopleChainId, hubChainId] as [
		NetworkId,
		SystemChainId,
		SystemChainId,
	]

	let providerRelay
	let providerPeople
	let hubProvider

	if (providerType === 'ws') {
		// When autoRpc is enabled, use all RPC endpoints for automatic failover. Otherwise, use the
		// specific selected endpoint
		if (autoRpc) {
			providerRelay = new WsProvider(Object.values(relayData.endpoints.rpc))
			providerPeople = new WsProvider(Object.values(peopleData.endpoints.rpc))
			hubProvider = new WsProvider(Object.values(hubData.endpoints.rpc))
		} else {
			providerRelay = new WsProvider(
				relayData.endpoints.rpc[rpcEndpoints[network]],
			)
			providerPeople = new WsProvider(
				peopleData.endpoints.rpc[rpcEndpoints[peopleChainId]],
			)
			hubProvider = new WsProvider(
				hubData.endpoints.rpc[rpcEndpoints[hubChainId]],
			)
		}
	} else {
		// Initialize relay chain first and reuse it for system chains
		const relaySetup = await newRelayChainSmProvider(relayData)
		providerRelay = relaySetup.provider

		// Reuse the relay chain client and chain instance for system chains
		providerPeople = await newSystemChainSmProvider(
			relaySetup.client,
			relaySetup.relayChain,
			peopleData,
		)
		hubProvider = await newSystemChainSmProvider(
			relaySetup.client,
			relaySetup.relayChain,
			hubData,
		)
	}

	setMultiApiStatus({
		[network]: 'connecting',
		[peopleChainId]: 'disconnected',
		[hubChainId]: 'connecting',
	})

	const apiHub = await DedotClient.new<Service[T][2]>(hubProvider)

	setMultiApiStatus({
		[network]: 'ready',
		[hubChainId]: 'ready',
	})

	return {
		Service: Services[network],
		apis: [apiHub],
		ids,
		providerRelay,
		providerPeople,
	}
}
