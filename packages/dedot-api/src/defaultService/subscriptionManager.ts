// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getActiveAddress,
	importedAccounts$,
	reconnectSync$,
} from '@polkadot-cloud/connect-core'
import {
	getLocalActiveProxy,
	proxies$,
	setActiveProxy,
} from '@polkadot-cloud/connect-proxies'
import type { DedotClient } from 'dedot'
import {
	activePoolIds$,
	bonded$,
	fetchAndSetPoolWarnings,
	getSyncing,
	removeSyncing,
} from 'global-bus'
import { combineLatest, pairwise, type Subscription, startWith } from 'rxjs'
import type { NetworkId, ServiceInterface, SystemChainId } from 'types'
import { AccountBalanceQuery } from '../subscribe/accountBalance'
import { ActivePoolQuery } from '../subscribe/activePool'
import { BondedQuery } from '../subscribe/bonded'
import { EraRewardPointsQuery } from '../subscribe/eraRewardPoints'
import { PoolMembershipQuery } from '../subscribe/poolMembership'
import { StakingLedgerQuery } from '../subscribe/stakingLedger'
import { StakingMetricsQuery } from '../subscribe/stakingMetrics'
import type {
	ActivePools,
	AssetHubChain,
	BondedAccounts,
	PeopleChain,
	PoolMemberships,
	StakingChain,
	StakingLedgers,
} from '../types'
import {
	diffBonded,
	diffImportedAccounts,
	diffPoolIds,
	formatAccountAddresses,
	getAccountKey,
} from '../util'
import type { AccountBalances } from './types'

// Manages all subscriptions for a default service
export class SubscriptionManager<
	PeopleApi extends PeopleChain,
	HubApi extends AssetHubChain,
	StakingApi extends StakingChain,
> {
	subActiveAddress: Subscription
	subImportedAccounts: Subscription
	subActiveEra: Subscription
	subAccountBalances: AccountBalances<PeopleApi, HubApi> = {
		people: {},
		hub: {},
	}
	subBonded: BondedAccounts<StakingApi> = {}
	subStakingLedgers: StakingLedgers<StakingApi> = {}
	subActivePoolIds: Subscription
	subActivePools: ActivePools<StakingApi> = {}
	subPoolMemberships: PoolMemberships<StakingApi> = {}
	subActiveProxies: Subscription
	subActiveBonded: Subscription

	// Query objects that may need to be recreated
	stakingMetrics: StakingMetricsQuery<StakingApi>
	eraRewardPoints: EraRewardPointsQuery<StakingApi>

	constructor(
		private apiHub: DedotClient<HubApi>,
		private stakingApi: DedotClient<StakingApi>,
		private ids: [NetworkId, SystemChainId, SystemChainId],
		private stakingConsts: { poolsPalletId: Uint8Array },
		private serviceInterface: ServiceInterface,
	) {}

	// Initialize default service subscriptions
	initialize() {
		// Imported accounts subscription - manages account balances and related subscriptions
		this.subImportedAccounts = importedAccounts$
			.pipe(startWith([], [], []), pairwise())
			.subscribe(([prev, cur]) => {
				const ss58 = this.apiHub.consts.system.ss58Prefix
				const formattedCur = formatAccountAddresses(cur.flat(), ss58)
				const { added, removed, remaining } = diffImportedAccounts(
					prev.flat(),
					formattedCur,
				)

				removed.forEach((account) => {
					const address = account.address

					// Only unsubscribe from address subscriptions if no other imported account with same
					// address exists
					const addressFound = formattedCur.find(
						(c) => c.address === account.address,
					)
					if (!addressFound) {
						Object.values(this.subAccountBalances).forEach((balances) => {
							Object.keys(balances).forEach((key) => {
								if (key.endsWith(`:${address}`)) {
									balances[key]?.unsubscribe()
									delete balances[key]
								}
							})
						})
						this.subBonded[address]?.unsubscribe()
						delete this.subBonded[address]
						this.subPoolMemberships?.[address]?.unsubscribe()
						delete this.subPoolMemberships[address]
					}
				})

				const addedAddresses: string[] = []
				for (const account of added) {
					const address = account.address

					// Address individuality checks
					const addressAlreadyAdded = addedAddresses.some((a) => a === address)
					const addressAlreadyPresent = remaining.some(
						(a) => a?.address === address,
					)
					// Only subscribe to address subscriptions if no other occurrence of the address exists
					if (!addressAlreadyAdded && !addressAlreadyPresent) {
						this.subAccountBalances.hub[getAccountKey(this.ids[2], address)] =
							new AccountBalanceQuery(this.apiHub, this.ids[2], address)

						this.subBonded[address] = new BondedQuery(this.stakingApi, address)
						this.subPoolMemberships[address] = new PoolMembershipQuery(
							this.stakingApi,
							address,
						)
					}
					addedAddresses.push(address)
				}

				// Fetch pool warnings for added addresses
				if (addedAddresses.length > 0) {
					fetchAndSetPoolWarnings(this.ids[0], addedAddresses)
				}
			})

		// Active bonded subscription - manages staking ledgers
		this.subActiveBonded = bonded$
			.pipe(startWith([]), pairwise())
			.subscribe(([prev, cur]) => {
				const { added, removed } = diffBonded(prev, cur)
				removed.forEach(({ stash }) => {
					this.subStakingLedgers?.[stash]?.unsubscribe()
				})
				added.forEach(({ stash, bonded }) => {
					this.subStakingLedgers[stash] = new StakingLedgerQuery(
						this.stakingApi,
						stash,
						bonded,
					)
				})
			})

		// Active proxies subscription - manages proxy state
		this.subActiveProxies = combineLatest([proxies$, reconnectSync$]).subscribe(
			([proxies, sync]) => {
				const activeAddress = getActiveAddress()
				const proxiesSynced = Object.keys(proxies).find(
					(address) => address === activeAddress,
				)
				const localProxy = getLocalActiveProxy(this.ids[0])
				if (sync === 'synced' && getSyncing('active-proxy')) {
					if (!activeAddress) {
						removeSyncing('active-proxy')
						return
					}
					if (proxiesSynced && activeAddress && localProxy) {
						for (const { proxyType, delegate } of proxies[activeAddress]
							.proxies) {
							if (
								proxyType === localProxy.proxyType &&
								delegate === localProxy.address
							) {
								setActiveProxy(this.ids[0], localProxy)
								break
							}
						}
					}
					removeSyncing('active-proxy')
				}
			},
		)

		// Active pool IDs subscription - manages active pools
		this.subActivePoolIds = activePoolIds$
			.pipe(startWith([]), pairwise())
			.subscribe(([prev, cur]) => {
				const { added, removed } = diffPoolIds(prev, cur)
				removed.forEach((poolId) => {
					this.subActivePools[poolId]?.unsubscribe()
				})
				added.forEach((poolId) => {
					this.subActivePools[poolId] = new ActivePoolQuery(
						this.stakingApi,
						poolId,
						this.stakingConsts.poolsPalletId,
						this.serviceInterface,
					)
				})
			})
	}

	// Set the active era subscription with the provided observable
	setActiveEraSubscription(activeEra$: {
		subscribe: (
			callback: (data: { index: number }) => Promise<void>,
		) => Subscription
	}) {
		this.subActiveEra = activeEra$.subscribe(
			async ({ index }: { index: number }) => {
				if (index > 0) {
					this.stakingMetrics?.unsubscribe()
					this.stakingMetrics = new StakingMetricsQuery(this.stakingApi, index)
					this.eraRewardPoints?.unsubscribe()
					this.eraRewardPoints = new EraRewardPointsQuery(
						this.stakingApi,
						index,
					)
				}
			},
		)
	}

	// Unsubscribe from all subscriptions
	async unsubscribe() {
		for (const sub of Object.values(this.subActivePools)) {
			sub?.unsubscribe()
		}
		this.subActiveProxies?.unsubscribe()
		this.subActivePoolIds?.unsubscribe()
		this.subActiveBonded?.unsubscribe()
		for (const subs of Object.values(this.subAccountBalances)) {
			for (const sub of Object.values(subs)) {
				sub?.unsubscribe()
			}
		}
		for (const sub of Object.values(this.subStakingLedgers)) {
			sub?.unsubscribe()
		}
		for (const sub of Object.values(this.subBonded)) {
			sub?.unsubscribe()
		}
		for (const sub of Object.values(this.subPoolMemberships)) {
			sub?.unsubscribe()
		}
		this.subActiveEra?.unsubscribe()
		this.subActiveAddress?.unsubscribe()
		this.subImportedAccounts?.unsubscribe()

		this.stakingMetrics?.unsubscribe()
		this.eraRewardPoints?.unsubscribe()
	}
}
