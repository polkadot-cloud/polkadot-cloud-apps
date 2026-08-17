// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AutoRpcKey, NetworkKey, ProviderTypeKey, rpcEndpointKey } from 'consts'
import type { NetworkId, ProviderType, RpcEndpoints } from 'types'

export const setLocalNetwork = (network: NetworkId) => {
	localStorage.setItem(NetworkKey, network)
}

export const setLocalRpcEndpoints = (
	network: NetworkId,
	rpcEndpoints: RpcEndpoints,
) => {
	localStorage.setItem(rpcEndpointKey(network), JSON.stringify(rpcEndpoints))
}

export const setLocalProviderType = (providerType: ProviderType) => {
	localStorage.setItem(ProviderTypeKey, providerType)
}

export const setLocalAutoRpc = (autoRpc: boolean) => {
	localStorage.setItem(AutoRpcKey, String(autoRpc))
}
