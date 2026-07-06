// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SyncTimeoutDuration } from 'consts'
import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import {
	addActivePoolId,
	defaultPoolMembership,
	removeActivePoolId,
	removePoolMembership,
	setPoolMembership,
} from 'global-bus'
import type { PoolMembershipState } from 'types'
import type { StakingChain } from '../types'

export class PoolMembershipQuery<T extends StakingChain> {
	#unsub: Unsub | undefined = undefined
	#poolId: number | undefined = undefined
	#syncTimeout: ReturnType<typeof setTimeout> | undefined = undefined
	#synced = false

	constructor(
		public api: DedotClient<T>,
		public address: string,
	) {
		this.api = api
		// If the subscription has not delivered data within the sync timeout
		// window (e.g. on a slow or unresponsive RPC), mark membership as synced
		// with default data so the UI does not hang indefinitely. The live
		// subscription stays active and overwrites this once real data arrives.
		this.#syncTimeout = setTimeout(() => {
			this.#markSyncedFallback()
		}, SyncTimeoutDuration)
		this.subscribe()
	}

	async subscribe() {
		try {
			this.#unsub = await this.api.queryMulti(
				[
					{
						fn: this.api.query.nominationPools.poolMembers,
						args: [this.address],
					},
					{
						fn: this.api.query.nominationPools.claimPermissions,
						args: [this.address],
					},
				],
				async ([poolMember, claimPermission]) => {
					this.#synced = true
					this.#clearSyncTimeout()
					let balance = 0n
					let pendingRewards = 0n

					if (poolMember) {
						;[balance, pendingRewards] = await Promise.all([
							this.api.call.nominationPoolsApi.pointsToBalance(
								poolMember.poolId,
								poolMember.points,
							),
							this.api.call.nominationPoolsApi.pendingRewards(this.address),
						])
					}

					const poolMembership: PoolMembershipState = {
						synced: true,
						membership:
							poolMember === undefined
								? undefined
								: {
										address: this.address,
										poolId: poolMember.poolId,
										points: poolMember.points,
										balance,
										lastRecordedRewardCounter:
											poolMember.lastRecordedRewardCounter,
										unbondingEras: poolMember.unbondingEras,
										claimPermission,
										pendingRewards,
									},
					}
					setPoolMembership(this.address, poolMembership)

					switch (this.getPoolIdUpdate(poolMembership)) {
						case 'remove':
							if (this.#poolId) {
								removeActivePoolId(this.#poolId)
								this.#poolId = undefined
							}
							break
						case 'set':
							if (poolMembership.membership) {
								this.#poolId = poolMembership.membership.poolId
								addActivePoolId(this.#poolId)
							}
					}
				},
			)
		} catch {
			// The subscription failed to establish; unblock the UI with defaults
			this.#markSyncedFallback()
		}
	}

	// Marks membership as synced with default data if real data has not yet
	// arrived, so consumers waiting on `synced` are not blocked indefinitely
	#markSyncedFallback() {
		this.#clearSyncTimeout()
		if (!this.#synced) {
			setPoolMembership(this.address, {
				...defaultPoolMembership,
				synced: true,
			})
		}
	}

	#clearSyncTimeout() {
		if (this.#syncTimeout) {
			clearTimeout(this.#syncTimeout)
			this.#syncTimeout = undefined
		}
	}

	getPoolIdUpdate = ({ membership }: PoolMembershipState) => {
		const cur = membership?.poolId
		return !cur && this.#poolId ? 'remove' : cur ? 'set' : undefined
	}

	unsubscribe() {
		this.#clearSyncTimeout()
		this.#unsub?.()
		removePoolMembership(this.address)

		if (this.#poolId) {
			removeActivePoolId(this.#poolId)
		}
	}
}
