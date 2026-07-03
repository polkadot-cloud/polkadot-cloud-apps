// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId, Networks } from 'types'
import { NetworkList, ProductionDisabledNetworks } from '../networks'

const isProd =
	(import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD === true

// Gets enabled networks depending on environment
export const getEnabledNetworks = (): Networks =>
	Object.entries(NetworkList).reduce((acc: Networks, [key, item]) => {
		if (!(isProd && ProductionDisabledNetworks.includes(key as NetworkId))) {
			acc[key] = item
		}
		return acc
	}, {})

// Checks if a network is enabled
export const isNetworkEnabled = (network: NetworkId) =>
	Object.keys(getEnabledNetworks()).includes(network)

// Checks if a network is valid key of `NetworkList`
export const isValidNetwork = (network: string): network is NetworkId =>
	Object.keys(NetworkList).includes(network)

// Get subscan balance chain id by network
export const getSubscanBalanceChainId = (network: NetworkId) =>
	NetworkList[network].meta.subscanBalanceChainId
