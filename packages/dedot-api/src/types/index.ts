// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { KusamaApi, PaseoApi, PolkadotApi } from '@dedot/chaintypes'
import type { KusamaAssetHubApi } from '@dedot/chaintypes/kusama-asset-hub'
import type { KusamaPeopleApi } from '@dedot/chaintypes/kusama-people'
import type { PaseoAssetHubApi } from '@dedot/chaintypes/paseo-asset-hub'
import type { PaseoPeopleApi } from '@dedot/chaintypes/paseo-people'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { PolkadotPeopleApi } from '@dedot/chaintypes/polkadot-people'
import type { ServiceInterface } from 'types'
import type { KusamaService } from '../services/kusama'
import type { PaseoService } from '../services/paseo'
import type { PolkadotService } from '../services/polkadot'
import type { ActivePoolQuery } from '../subscribe/activePool'
import type { BondedQuery } from '../subscribe/bonded'
import type { PoolMembershipQuery } from '../subscribe/poolMembership'
import type { StakingLedgerQuery } from '../subscribe/stakingLedger'

export type DedotServiceConfig = {
	nominationPools?: boolean
	staking?: boolean
	stablecoins?: {
		assetHub?: boolean
		hydration?: boolean
	}
}

export type DedotServiceFeatures = {
	nominationPools: boolean
	staking: boolean
	stablecoins: {
		assetHub: boolean
		hydration: boolean
	}
}

// All available chains
export type Chain =
	| PolkadotApi
	| PolkadotPeopleApi
	| PolkadotAssetHubApi
	| KusamaApi
	| KusamaPeopleApi
	| KusamaAssetHubApi
	| PaseoApi
	| PaseoPeopleApi
	| PaseoAssetHubApi

// Relay chains
export type RelayChain = PolkadotApi | KusamaApi | PaseoApi

// People chains
export type PeopleChain = PolkadotPeopleApi | KusamaPeopleApi | PaseoPeopleApi

// Asset hub chains
export type AssetHubChain =
	| PolkadotAssetHubApi
	| KusamaAssetHubApi
	| PaseoAssetHubApi

// Chains that are used for staking and nomination pools
export type StakingChain =
	| PolkadotAssetHubApi
	| KusamaAssetHubApi
	| PaseoAssetHubApi

// Mapping of service types for each network
export interface ServiceType {
	polkadot: typeof PolkadotService
	kusama: typeof KusamaService
	paseo: typeof PaseoService
}

// Mapping of the required chains for each service
export type Service = {
	polkadot: [PolkadotApi, PolkadotPeopleApi, PolkadotAssetHubApi, PolkadotApi]
	kusama: [KusamaApi, KusamaPeopleApi, KusamaAssetHubApi, KusamaApi]
	paseo: [PaseoApi, PaseoPeopleApi, PaseoAssetHubApi, PaseoAssetHubApi]
}

// Generic service class that all services must implement
export abstract class ServiceClass {
	abstract interface: ServiceInterface

	abstract start(): Promise<void>
	abstract unsubscribe(): Promise<void>
}

// Bonded record
export type BondedAccounts<StakingApi extends StakingChain> = Record<
	string,
	BondedQuery<StakingApi>
>

// Staking ledgers record
export type StakingLedgers<StakingApi extends StakingChain> = Record<
	string,
	StakingLedgerQuery<StakingApi>
>

// Active pools record
export type ActivePools<StakingApi extends StakingChain> = Record<
	number,
	ActivePoolQuery<StakingApi>
>

// Pool Memberships record
export type PoolMemberships<StakingApi extends StakingChain> = Record<
	string,
	PoolMembershipQuery<StakingApi>
>
