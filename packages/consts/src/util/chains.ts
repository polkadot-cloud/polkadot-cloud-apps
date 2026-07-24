// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainId, NetworkId, SystemChainId } from 'types'
import { NetworkList, SystemChainList } from '../networks'

// Get relay chain data from network list
export const getRelayChainData = (network: NetworkId) => NetworkList[network]

// Get relay chain consts
export const getRelayChainConsts = (network: NetworkId) =>
	NetworkList[network].consts

// Get system chain data from system chain list
export const getSystemChainData = (chain: SystemChainId) =>
	SystemChainList[chain]

// Get staking chain data from either network list or system chain list
export const getStakingChainData = (network: NetworkId) => {
	const relayChainData = NetworkList[network]
	const stakingChain = relayChainData.meta.stakingChain
	if (stakingChain === network) {
		return relayChainData
	}
	if (Object.keys(SystemChainList).includes(stakingChain)) {
		return SystemChainList[stakingChain]
	}
	// NOTE: fallback - should not happen
	return relayChainData
}

// Get Hub chain id from network id
export const getHubChainId = (network: NetworkId): ChainId =>
	NetworkList[network].meta.hubChain

// Get People chain id from network id
export const getPeopleChainId = (network: NetworkId): ChainId =>
	NetworkList[network].meta.peopleChain

// Get default staking chain for a network
export const getStakingChain = (network: NetworkId) =>
	NetworkList[network].meta.stakingChain
