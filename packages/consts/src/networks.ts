// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId, Networks, SystemChain } from 'types'
import { RpcEndpointsByChain } from './rpc'

// The default network to use when no network is specified
export const DefaultNetwork: NetworkId = 'polkadot'

// Networks that are disabled in production
export const ProductionDisabledNetworks: NetworkId[] = ['westend']

// All supported networks
export const NetworkList: Networks = {
	polkadot: {
		name: 'polkadot',
		endpoints: {
			getLightClient: async () => await import('@dedot/chain-specs/polkadot'),
			rpc: RpcEndpointsByChain.polkadot,
		},
		unit: 'DOT',
		units: 10,
		ss58: 0,
		defaultFeeReserve: 1000000000n,
		consts: {
			expectedBlockTime: 6000n,
			epochDuration: 2400n,
		},
		meta: {
			hubChain: 'statemint',
			peopleChain: 'people-polkadot',
			stakingChain: 'statemint',
			subscanBalanceChainId: 'assethub-polkadot',
			supportOperators: true,
		},
	},
	kusama: {
		name: 'kusama',
		endpoints: {
			getLightClient: async () => await import('@dedot/chain-specs/ksmcc3'),
			rpc: RpcEndpointsByChain.kusama,
		},
		unit: 'KSM',
		units: 12,
		ss58: 2,
		defaultFeeReserve: 50000000000n,
		consts: {
			expectedBlockTime: 6000n,
			epochDuration: 600n,
		},
		meta: {
			hubChain: 'statemine',
			peopleChain: 'people-kusama',
			stakingChain: 'statemine',
			subscanBalanceChainId: 'assethub-kusama',
			supportOperators: true,
		},
	},
	westend: {
		name: 'westend',
		endpoints: {
			getLightClient: async () => await import('@dedot/chain-specs/westend2'),
			rpc: RpcEndpointsByChain.westend,
		},
		unit: 'WND',
		units: 12,
		ss58: 42,
		defaultFeeReserve: 100000000000n,
		consts: {
			expectedBlockTime: 6000n,
			epochDuration: 600n,
		},
		meta: {
			hubChain: 'westmint',
			stakingChain: 'westmint',
			peopleChain: 'people-westend',
			subscanBalanceChainId: 'assethub-westend',
			supportOperators: false,
		},
	},
	paseo: {
		name: 'paseo',
		endpoints: {
			getLightClient: async () => await import('@dedot/chain-specs/paseo'),
			rpc: RpcEndpointsByChain.paseo,
		},
		unit: 'PAS',
		units: 10,
		ss58: 0,
		defaultFeeReserve: 1000000000n,
		consts: {
			expectedBlockTime: 6000n,
			epochDuration: 600n,
		},
		meta: {
			hubChain: 'paseomint',
			peopleChain: 'people-paseo',
			stakingChain: 'paseomint',
			subscanBalanceChainId: 'assethub-paseo',
			supportOperators: false,
		},
	},
}

// All supported system chains
export const SystemChainList: Record<string, SystemChain> = {
	'people-polkadot': {
		name: 'people-polkadot',
		ss58: 0,
		units: 10,
		unit: 'DOT',
		defaultFeeReserve: 1000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/polkadot_people'),
			rpc: RpcEndpointsByChain['people-polkadot'],
		},
		relayChain: 'polkadot',
	},
	'people-kusama': {
		name: 'people-kusama',
		ss58: 2,
		units: 12,
		unit: 'KSM',
		defaultFeeReserve: 50000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/ksmcc3_people'),
			rpc: RpcEndpointsByChain['people-kusama'],
		},
		relayChain: 'kusama',
	},
	'people-westend': {
		name: 'people-westend',
		ss58: 42,
		units: 12,
		unit: 'WND',
		defaultFeeReserve: 100000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/westend2_people'),
			rpc: RpcEndpointsByChain['people-westend'],
		},
		relayChain: 'westend',
	},
	statemint: {
		name: 'statemint',
		ss58: 0,
		units: 10,
		unit: 'DOT',
		defaultFeeReserve: 1000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/polkadot_asset_hub'),
			rpc: RpcEndpointsByChain.statemint,
		},
		relayChain: 'polkadot',
	},
	statemine: {
		name: 'statemine',
		ss58: 2,
		units: 12,
		unit: 'KSM',
		defaultFeeReserve: 50000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/ksmcc3_asset_hub'),
			rpc: RpcEndpointsByChain.statemine,
		},
		relayChain: 'kusama',
	},
	westmint: {
		name: 'westmint',
		ss58: 42,
		units: 12,
		unit: 'WND',
		defaultFeeReserve: 100000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/westend2_asset_hub'),
			rpc: RpcEndpointsByChain.westmint,
		},
		relayChain: 'westend',
	},
	'people-paseo': {
		name: 'people-paseo',
		ss58: 0,
		units: 10,
		unit: 'PAS',
		defaultFeeReserve: 1000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/paseo_people'),
			rpc: RpcEndpointsByChain['people-paseo'],
		},
		relayChain: 'paseo',
	},
	paseomint: {
		name: 'paseomint',
		ss58: 0,
		units: 10,
		unit: 'PAS',
		defaultFeeReserve: 1000000000n,
		endpoints: {
			getLightClient: async () =>
				await import('@dedot/chain-specs/paseo_asset_hub'),
			rpc: RpcEndpointsByChain.paseomint,
		},
		relayChain: 'paseo',
	},
}
