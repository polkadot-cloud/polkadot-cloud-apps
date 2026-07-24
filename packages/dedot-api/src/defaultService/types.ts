// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient, SmoldotProvider, WsProvider } from 'dedot'
import type { Subscription } from 'rxjs'
import type {
	IdentityOf,
	NetworkConfig,
	NetworkId,
	ServiceInterface,
	SuperOf,
	SystemChainId,
} from 'types'
import type { StakingConsts } from '../consts/staking'
import type { ApiStatus } from '../spec/apiStatus'
import type { ChainSpecs } from '../spec/chainSpecs'
import type { AccountBalanceQuery } from '../subscribe/accountBalance'
import type { ActiveEraQuery } from '../subscribe/activeEra'
import type { BlockNumberQuery } from '../subscribe/blockNumber'
import type { EraRewardPointsQuery } from '../subscribe/eraRewardPoints'
import type { PoolsConfigQuery } from '../subscribe/poolsConfig'
import type { StakingMetricsQuery } from '../subscribe/stakingMetrics'
import type {
	ActivePools,
	AssetHubChain,
	BondedAccounts,
	PeopleChain,
	PoolMemberships,
	Service,
	ServiceType,
	StakingChain,
	StakingLedgers,
} from '../types'
import { ServiceClass } from '../types'

// Required interface for all default services
export abstract class DefaultServiceClass<
	PeopleApi extends PeopleChain,
	HubApi extends AssetHubChain,
	StakingApi extends StakingChain,
> extends ServiceClass {
	constructor(
		public networkConfig: NetworkConfig,
		public apiHub: DedotClient<HubApi>,
	) {
		super()
	}
	abstract ids: [NetworkId, SystemChainId, SystemChainId]
	abstract apiStatus: {
		hub: ApiStatus<HubApi>
	}
	abstract getLiveApi: (id: string) => DedotClient<HubApi>

	abstract hubChainSpec: ChainSpecs<HubApi>
	abstract stakingConsts: StakingConsts<StakingApi>

	abstract blockNumber: BlockNumberQuery<HubApi>
	abstract activeEra: ActiveEraQuery<StakingApi>
	abstract poolsConfig: PoolsConfigQuery<StakingApi>
	abstract stakingMetrics: StakingMetricsQuery<StakingApi>
	abstract eraRewardPoints: EraRewardPointsQuery<StakingApi>

	subActiveAddress: Subscription
	subImportedAccounts: Subscription
	subActiveEra: Subscription
	subAccountBalances: AccountBalances<PeopleApi, HubApi>
	subBonded: BondedAccounts<StakingApi>
	subStakingLedgers: StakingLedgers<StakingApi>
	subActivePoolIds: Subscription
	subActivePools: ActivePools<StakingApi>
	subPoolMemberships: PoolMemberships<StakingApi>
	subActiveProxies: Subscription

	abstract interface: ServiceInterface
}

// Default interface a default service factory returns
export type DefaultService<T extends keyof ServiceType> = {
	Service: ServiceType[T]
	apis: [DedotClient<Service[T][2]>]
	ids: [NetworkId, SystemChainId, SystemChainId]
	providerRelay: WsProvider | SmoldotProvider
	providerPeople: WsProvider | SmoldotProvider
}

// Account balances record
export type AccountBalances<
	PeopleApi extends PeopleChain,
	HubApi extends AssetHubChain,
> = {
	people: Record<string, AccountBalanceQuery<PeopleApi>>
	hub: Record<string, AccountBalanceQuery<HubApi>>
}

// Identity manager queue interface for pending queries
export interface IdentityQueueItem {
	type: 'identityOfMulti'
	addresses: string[]
	resolve: (result: IdentityOf[]) => void
	reject: (error: unknown) => void
}

export interface SuperQueueItem {
	type: 'superOfMulti'
	addresses: string[]
	resolve: (result: SuperOf[]) => void
	reject: (error: unknown) => void
}

export type QueueItem = IdentityQueueItem | SuperQueueItem
