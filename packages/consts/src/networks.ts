// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId, Networks, SystemChain } from 'types'

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
			rpc: {
				'Automata 1RPC': 'wss://1rpc.io/dot',
				// Dwellir: 'wss://polkadot-rpc.dwellir.com',
				// IBP1: 'wss://rpc.ibp.network/polkadot',
				// IBP2: 'wss://rpc.dotters.network/polkadot',
				LuckyFriday: 'wss://rpc-polkadot.luckyfriday.io',
				OnFinality: 'wss://polkadot.api.onfinality.io/public-ws',
				Stakeworld: 'wss://dot-rpc.stakeworld.io',
			},
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
			rpc: {
				'Automata 1RPC': 'wss://1rpc.io/ksm',
				// Dwellir: 'wss://kusama-rpc.dwellir.com',
				// IBP1: 'wss://rpc.ibp.network/kusama',
				// IBP2: 'wss://rpc.dotters.network/kusama',
				LuckyFriday: 'wss://rpc-kusama.luckyfriday.io',
				OnFinality: 'wss://kusama.api.onfinality.io/public-ws',
				Stakeworld: 'wss://ksm-rpc.stakeworld.io',
			},
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
			rpc: {
				// Dwellir: 'wss://westend-rpc.dwellir.com',
				// IBP1: 'wss://rpc.ibp.network/westend',
				// IBP2: 'wss://rpc.dotters.network/westend',
				LuckyFriday: 'wss://rpc-westend.luckyfriday.io',
				OnFinality: 'wss://westend.api.onfinality.io/public-ws',
				Stakeworld: 'wss://wnd-rpc.stakeworld.io',
			},
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
			rpc: {
				IBP1: 'wss://rpc.ibp.network/paseo',
				IBP2: 'wss://paseo.dotters.network',
				Amforc: 'wss://paseo.rpc.amforc.com',
				Dwellir: 'wss://paseo-rpc.dwellir.com',
				StakeWorld: 'wss://pas-rpc.stakeworld.io',
			},
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
			rpc: {
				PolkadotPeople: 'wss://polkadot-people-rpc.polkadot.io',
				LuckyFriday: 'wss://rpc-people-polkadot.luckyfriday.io',
				RadiumBlock: 'wss://people-polkadot.public.curie.radiumblock.co/ws',
				// IBP1: 'wss://sys.ibp.network/people-polkadot',
				// IBP2: 'wss://people-polkadot.dotters.network',
				'Sys Dotters': 'wss://sys.dotters.network/people-polkadot',
			},
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
			rpc: {
				Parity: 'wss://kusama-people-rpc.polkadot.io',
				Stakeworld: 'wss://ksm-rpc.stakeworld.io/people',
				// IBP1: 'wss://sys.ibp.network/people-kusama',
				// IBP2: 'wss://people-kusama.dotters.network',
				LuckyFriday: 'wss://rpc-people-kusama.luckyfriday.io',
			},
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
			rpc: {
				// IBP1: 'wss://sys.ibp.network/people-westend',
				// IBP2: 'wss://people-westend.dotters.network',
			},
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
			rpc: {
				DeServe: 'wss://asset-hub.polkadot.rpc.deserve.network',
				// LuckyFriday: 'wss://rpc-asset-hub-polkadot.luckyfriday.io',
				// Parity: 'wss://polkadot-asset-hub-rpc.polkadot.io',
				StakeWorld: 'wss://dot-rpc.stakeworld.io/assethub',
				// Dwellir: 'wss://asset-hub-polkadot-rpc.dwellir.com',
				// IBP1: 'wss://sys.ibp.network/asset-hub-polkadot',
				// IBP2: 'wss://asset-hub-polkadot.dotters.network',
			},
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
			rpc: {
				LuckyFriday: 'wss://rpc-asset-hub-kusama.luckyfriday.io',
				Parity: 'wss://kusama-asset-hub-rpc.polkadot.io',
				// IBP1: 'wss://sys.ibp.network/asset-hub-kusama',
				// IBP2: 'wss://asset-hub-kusama.dotters.network',
			},
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
			rpc: {
				Parity: 'wss://westend-asset-hub-rpc.polkadot.io',
				// Dwellir: 'wss://asset-hub-westend-rpc.dwellir.com',
				// IBP1: 'wss://sys.ibp.network/asset-hub-westend',
				// IBP2: 'wss://asset-hub-westend.dotters.network',
				'Permanence DAO EU': 'wss://asset-hub-westend.rpc.permanence.io',
			},
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
			rpc: {
				IBP2: 'wss://people-paseo.dotters.network',
				Amforc: 'wss://people-paseo.rpc.amforc.com',
			},
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
			rpc: {
				IBP1: 'wss://sys.ibp.network/asset-hub-paseo',
				IBP2: 'wss://asset-hub-paseo.dotters.network',
				Dwellir: 'wss://asset-hub-paseo-rpc.dwellir.com',
				StakeWorld: 'wss://pas-rpc.stakeworld.io/assethub',
				TurboFlakes: 'wss://sys.turboflakes.io/asset-hub-paseo',
			},
		},
		relayChain: 'paseo',
	},
}
