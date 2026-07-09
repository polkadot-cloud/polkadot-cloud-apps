// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainProperties } from 'dedot/types/json-rpc'
import type { HexString } from 'dedot/utils'
import type { FunctionComponent, SVGProps } from 'react'

export type ChainId = NetworkId | SystemChainId

export type NetworkId = DefaultServiceNetworkId

export type DefaultServiceNetworkId =
	| 'polkadot'
	| 'kusama'
	| 'westend'
	| 'paseo'

export type SystemChainId =
	| 'people-polkadot'
	| 'people-kusama'
	| 'people-westend'
	| 'people-paseo'
	| 'statemint'
	| 'statemine'
	| 'westmint'
	| 'paseomint'

export type ProviderType = 'ws' | 'sc'

export type Networks = Record<string, Network>

export type RpcEndpoints = Record<string, string>

export type ApiStatus = 'connecting' | 'connected' | 'disconnected' | 'ready'

export interface ActiveEra {
	index: number
	start: bigint
}

export interface ChainSpec {
	genesisHash: HexString
	properties: ChainProperties
	existentialDeposit: bigint
	version: ChainSpecVersion
}

export interface ChainSpecVersion {
	specName: string
	implName: string
	authoringVersion: number
	specVersion: number
	implVersion: number
	apis: (readonly [HexString, number])[]
	transactionVersion: number
	stateVersion: number
}

export interface ChainConsts {
	bondDuration: number
	unbondDuration: number
	sessionsPerEra: number
	maxExposurePageSize: number
	historyDepth: number
	poolsPalletId: Uint8Array
}

export interface RelayMetrics {
	auctionCounter: number
	earliestStoredSession: number
}

export interface PoolsConfig {
	counterForPoolMembers: number
	counterForBondedPools: number
	counterForRewardPools: number
	lastPoolId: number
	maxPoolMembers: number | undefined
	maxPoolMembersPerPool: number | undefined
	maxPools: number | undefined
	minCreateBond: bigint
	minJoinBond: bigint
	globalMaxCommission: number
}

export interface StakingMetrics {
	totalIssuance: bigint
	minimumActiveStake: bigint
	counterForValidators: number
	maxValidatorsCount: number | undefined
	validatorCount: number
	lastReward: bigint | undefined
	lastTotalStake: bigint
	minNominatorBond: bigint
	minValidatorBond: bigint
	totalStaked: bigint
	counterForNominators: number
}

export interface NetworkConfig {
	network: NetworkId
	rpcEndpoints: Record<string, string>
	providerType: ProviderType
	autoRpc: boolean
}

export interface Network {
	name: NetworkId
	endpoints: {
		// biome-ignore lint/suspicious/noExplicitAny: <>
		getLightClient: () => Promise<any>
		rpc: Record<string, string>
	}
	unit: string
	units: number
	ss58: number
	defaultFeeReserve: bigint
	consts: {
		expectedBlockTime: bigint
		epochDuration: bigint
	}
	meta: {
		hubChain: ChainId
		peopleChain: ChainId
		stakingChain: ChainId
		subscanBalanceChainId: string
		supportOperators: boolean
	}
}

export interface SystemChain {
	name: string
	ss58: number
	units: number
	unit: string
	defaultFeeReserve: bigint
	endpoints: {
		// biome-ignore lint/suspicious/noExplicitAny: <>
		getLightClient: () => Promise<any>
		rpc: Record<string, string>
	}
	relayChain: NetworkId
}

export interface ChainIcons {
	icon: FunctionComponent<
		SVGProps<SVGSVGElement> & { title?: string | undefined }
	>
	token: FunctionComponent<
		SVGProps<SVGSVGElement> & { title?: string | undefined }
	>
	inline: {
		svg: FunctionComponent<
			SVGProps<SVGSVGElement> & { title?: string | undefined }
		>
		size: string
	}
}
