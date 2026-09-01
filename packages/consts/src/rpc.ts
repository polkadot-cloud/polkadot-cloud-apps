// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainId, RpcEndpoints } from 'types'
// import { PolkchadotCloudRpcStatemintUrl } from '.'

export type RpcChainId = ChainId | 'hydration'

const isProduction =
	(import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD === true

export const DefaultRpcProviderByChain: Partial<Record<RpcChainId, string>> =
	isProduction ? { statemint: 'Polkadot Cloud' } : {}

export const RpcEndpointsByChain: Record<RpcChainId, RpcEndpoints> = {
	polkadot: {
		'Automata 1RPC': 'wss://1rpc.io/dot',
		// Dwellir: 'wss://polkadot-rpc.dwellir.com',
		// IBP1: 'wss://rpc.ibp.network/polkadot',
		// IBP2: 'wss://rpc.dotters.network/polkadot',
		LuckyFriday: 'wss://rpc-polkadot.luckyfriday.io',
		OnFinality: 'wss://polkadot.api.onfinality.io/public-ws',
		Stakeworld: 'wss://dot-rpc.stakeworld.io',
	},
	kusama: {
		'Automata 1RPC': 'wss://1rpc.io/ksm',
		// Dwellir: 'wss://kusama-rpc.dwellir.com',
		// IBP1: 'wss://rpc.ibp.network/kusama',
		// IBP2: 'wss://rpc.dotters.network/kusama',
		LuckyFriday: 'wss://rpc-kusama.luckyfriday.io',
		OnFinality: 'wss://kusama.api.onfinality.io/public-ws',
		Stakeworld: 'wss://ksm-rpc.stakeworld.io',
	},
	paseo: {
		IBP1: 'wss://rpc.ibp.network/paseo',
		IBP2: 'wss://paseo.dotters.network',
		Amforc: 'wss://paseo.rpc.amforc.com',
		Dwellir: 'wss://paseo-rpc.dwellir.com',
		StakeWorld: 'wss://pas-rpc.stakeworld.io',
	},
	'people-polkadot': {
		PolkadotPeople: 'wss://polkadot-people-rpc.polkadot.io',
		LuckyFriday: 'wss://rpc-people-polkadot.luckyfriday.io',
		RadiumBlock: 'wss://people-polkadot.public.curie.radiumblock.co/ws',
		// IBP1: 'wss://sys.ibp.network/people-polkadot',
		// IBP2: 'wss://people-polkadot.dotters.network',
		'Sys Dotters': 'wss://sys.dotters.network/people-polkadot',
		Rotko: 'wss://people-polkadot.rotko.net',
	},
	'people-kusama': {
		Parity: 'wss://kusama-people-rpc.polkadot.io',
		Stakeworld: 'wss://ksm-rpc.stakeworld.io/people',
		// IBP1: 'wss://sys.ibp.network/people-kusama',
		// IBP2: 'wss://people-kusama.dotters.network',
		LuckyFriday: 'wss://rpc-people-kusama.luckyfriday.io',
		Rotko: 'wss://people-kusama.rotko.net',
	},
	'people-paseo': {
		IBP2: 'wss://people-paseo.dotters.network',
		Amforc: 'wss://people-paseo.rpc.amforc.com',
		Rotko: 'wss://people-paseo.rotko.net',
	},
	statemint: {
		// ...(isProduction ? { 'Polkadot Cloud': PolkadotCloudRpcStatemintUrl } : {}),
		DeServe: 'wss://asset-hub.polkadot.rpc.deserve.network',
		// LuckyFriday: 'wss://rpc-asset-hub-polkadot.luckyfriday.io',
		// Parity: 'wss://polkadot-asset-hub-rpc.polkadot.io',
		StakeWorld: 'wss://dot-rpc.stakeworld.io/assethub',
		// Dwellir: 'wss://asset-hub-polkadot-rpc.dwellir.com',
		// IBP1: 'wss://sys.ibp.network/asset-hub-polkadot',
		// IBP2: 'wss://asset-hub-polkadot.dotters.network',
	},
	statemine: {
		LuckyFriday: 'wss://rpc-asset-hub-kusama.luckyfriday.io',
		Parity: 'wss://kusama-asset-hub-rpc.polkadot.io',
		Rotko: 'wss://asset-hub-kusama.rotko.net',
		// IBP1: 'wss://sys.ibp.network/asset-hub-kusama',
		// IBP2: 'wss://asset-hub-kusama.dotters.network',
	},
	paseomint: {
		IBP1: 'wss://sys.ibp.network/asset-hub-paseo',
		IBP2: 'wss://asset-hub-paseo.dotters.network',
		Dwellir: 'wss://asset-hub-paseo-rpc.dwellir.com',
		StakeWorld: 'wss://pas-rpc.stakeworld.io/assethub',
		TurboFlakes: 'wss://sys.turboflakes.io/asset-hub-paseo',
	},
	hydration: {
		Dwellir: 'wss://hydration-rpc.n.dwellir.com',
		Subway: 'wss://subway.sin.hydration.cloud',
		Rotko: 'wss://hydration.rotko.net',
	},
}

export const getRpcEndpointList = (chain: RpcChainId): string[] =>
	Object.values(RpcEndpointsByChain[chain])
