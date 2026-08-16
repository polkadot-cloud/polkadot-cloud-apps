// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId, ProviderType, RpcEndpoints } from 'types'
import {
	setLocalAutoRpc,
	setLocalNetwork,
	setLocalProviderType,
	setLocalRpcEndpoints,
} from './local'
import { _networkConfig } from './private'

let lockedNetwork: NetworkId | undefined

export const networkConfig$ = _networkConfig.asObservable()

export const isNetworkAllowed = (network: NetworkId) =>
	lockedNetwork === undefined || network === lockedNetwork

export const getNetworkConfig = () => _networkConfig.getValue()

export const setNetworkConfig = (
	network: NetworkId,
	rpcEndpoints: RpcEndpoints,
	providerType: ProviderType,
	autoRpc: boolean,
) => {
	if (!isNetworkAllowed(network)) {
		return false
	}

	setLocalNetwork(network)
	setLocalRpcEndpoints(network, rpcEndpoints)
	setLocalProviderType(providerType)
	setLocalAutoRpc(autoRpc)
	_networkConfig.next({
		network,
		rpcEndpoints,
		providerType,
		autoRpc,
	})
	return true
}

export const getNetwork = () => getNetworkConfig().network

export const setNetwork = (network: NetworkId) => {
	if (!isNetworkAllowed(network)) {
		return false
	}

	setLocalNetwork(network)
	_networkConfig.next({
		...getNetworkConfig(),
		network,
	})
	return true
}

export const lockNetwork = (network: NetworkId) => {
	lockedNetwork = network
	setNetwork(network)
}

export const getRpcEndpoints = () => getNetworkConfig().rpcEndpoints

export const setRpcEndpoints = (
	network: NetworkId,
	rpcEndpoints: RpcEndpoints,
) => {
	setLocalRpcEndpoints(network, rpcEndpoints)
	_networkConfig.next({
		...getNetworkConfig(),
		rpcEndpoints,
	})
}

export const getProviderType = () => getNetworkConfig().providerType

export const setProviderType = (providerType: ProviderType) => {
	setLocalProviderType(providerType)
	_networkConfig.next({
		...getNetworkConfig(),
		providerType,
	})
}

export const getAutoRpc = () => getNetworkConfig().autoRpc

export const setAutoRpc = (autoRpc: boolean) => {
	setLocalAutoRpc(autoRpc)
	_networkConfig.next({
		...getNetworkConfig(),
		autoRpc,
	})
}

export * from './local'
