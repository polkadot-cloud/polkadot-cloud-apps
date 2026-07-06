// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient, SmoldotProvider, WsProvider } from 'dedot'
import {
	defaultSyncStatus,
	removeSyncing,
	setConsts,
	setMultiChainSpecs,
	setSyncingMulti,
} from 'global-bus'
import type {
	NetworkConfig,
	NetworkId,
	ServiceInterface,
	SystemChainId,
} from 'types'
import { StakingConsts } from '../consts/staking'
import { ApiStatus } from '../spec/apiStatus'
import { ChainSpecs } from '../spec/chainSpecs'
import { ActiveEraQuery } from '../subscribe/activeEra'
import { BlockNumberQuery } from '../subscribe/blockNumber'
import { PoolsConfigQuery } from '../subscribe/poolsConfig'
import type { AssetHubChain, PeopleChain, StakingChain } from '../types'
import { IdentityManager } from './identityManager'
import { SubscriptionManager } from './subscriptionManager'

// Base service utility that handles common initialization and management
export class BaseService<
	PeopleApi extends PeopleChain,
	HubApi extends AssetHubChain,
	StakingApi extends StakingChain,
> {
	// Chain specs of live apis
	hubChainSpec: ChainSpecs<HubApi>

	// API status of live apis
	apiStatus: {
		hub: ApiStatus<HubApi>
	}

	// Constants
	stakingConsts: StakingConsts<StakingApi>

	// Query objects
	blockNumber: BlockNumberQuery<HubApi>
	activeEra: ActiveEraQuery<StakingApi>
	poolsConfig: PoolsConfigQuery<StakingApi>

	// Subscription manager
	subscriptionManager: SubscriptionManager<PeopleApi, HubApi, StakingApi>

	// Identity manager
	identityManager: IdentityManager<PeopleApi>

	constructor(
		public networkConfig: NetworkConfig,
		public ids: [NetworkId, SystemChainId, SystemChainId],
		public apiHub: DedotClient<HubApi>,
		private stakingApi: DedotClient<StakingApi>,
		public providerRelay: WsProvider | SmoldotProvider,
		public providerPeople: WsProvider | SmoldotProvider,
	) {
		this.apiStatus = {
			hub: new ApiStatus(this.apiHub, ids[2], networkConfig),
		}
	}

	// Standard getLiveApi implementation used by all services. Currently only supporting hub api.
	getLiveApi = (_id: string) => {
		return this.apiHub
	}

	// Initialize the service with common setup logic
	async start(serviceInterface: ServiceInterface) {
		// Initialize chain specs
		this.hubChainSpec = new ChainSpecs(this.apiHub)

		// Initialize constants
		this.stakingConsts = new StakingConsts(this.stakingApi)

		// Set default sync status
		setSyncingMulti(defaultSyncStatus)

		// Fetch chain specs and constants
		await Promise.all([this.hubChainSpec.fetch(), this.stakingConsts.fetch()])

		// Set chain specs and constants
		setMultiChainSpecs({
			[this.ids[2]]: this.hubChainSpec.get(),
		})
		setConsts(this.ids[0], {
			...this.stakingConsts.get(),
		})

		// Initialize query objects
		this.blockNumber = new BlockNumberQuery(this.apiHub)
		this.activeEra = new ActiveEraQuery(this.stakingApi)
		this.poolsConfig = new PoolsConfigQuery(this.stakingApi)

		// Initialize subscription manager
		this.subscriptionManager = new SubscriptionManager(
			this.apiHub,
			this.stakingApi,
			this.ids,
			{ poolsPalletId: this.stakingConsts.poolsPalletId },
			serviceInterface,
		)

		// Initialize identity manager
		this.identityManager = new IdentityManager(this.providerPeople, this.ids[0])

		// Set up the active era subscription
		this.subscriptionManager.setActiveEraSubscription(this.activeEra.activeEra$)

		// Initialize all dynamic subscriptions
		this.subscriptionManager.initialize()

		removeSyncing('initialization')
	}

	// Common unsubscribe logic
	async unsubscribe() {
		await this.subscriptionManager.unsubscribe()

		this.blockNumber?.unsubscribe()
		this.poolsConfig?.unsubscribe()
		this.activeEra?.unsubscribe()

		try {
			await Promise.all([
				this.identityManager.api
					? this.identityManager.api.disconnect()
					: Promise.resolve(),
				this.apiHub.disconnect(),
			])
		} catch {
			// Silent disconnect error. Move on to network reset and rely on garbage collection
		}
	}

	// Expose subscription manager properties for compatibility with the default service interface
	get subActiveAddress() {
		return this.subscriptionManager.subActiveAddress
	}

	get subImportedAccounts() {
		return this.subscriptionManager.subImportedAccounts
	}

	get subActiveEra() {
		return this.subscriptionManager.subActiveEra
	}

	get subAccountBalances() {
		return this.subscriptionManager.subAccountBalances
	}

	get subBonded() {
		return this.subscriptionManager.subBonded
	}

	get subStakingLedgers() {
		return this.subscriptionManager.subStakingLedgers
	}

	get subActivePoolIds() {
		return this.subscriptionManager.subActivePoolIds
	}

	get subActivePools() {
		return this.subscriptionManager.subActivePools
	}

	get subPoolMemberships() {
		return this.subscriptionManager.subPoolMemberships
	}

	get subActiveProxies() {
		return this.subscriptionManager.subActiveProxies
	}

	get subActiveBonded() {
		return this.subscriptionManager.subActiveBonded
	}

	get stakingMetrics() {
		return this.subscriptionManager.stakingMetrics
	}

	get eraRewardPoints() {
		return this.subscriptionManager.eraRewardPoints
	}
}
