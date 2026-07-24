// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import {
	addActivePoolId,
	removeActivePoolId,
	removePoolMembership,
	setPoolMembership,
} from 'global-bus'
import type { PoolMembershipState } from 'types'
import type { StakingChain } from '../types'

export class PoolMembershipQuery<T extends StakingChain> {
	#unsub: Unsub | undefined = undefined
	#poolId: number | undefined = undefined

	constructor(
		public api: DedotClient<T>,
		public address: string,
	) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
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
	}

	getPoolIdUpdate = ({ membership }: PoolMembershipState) => {
		const cur = membership?.poolId
		return !cur && this.#poolId ? 'remove' : cur ? 'set' : undefined
	}

	unsubscribe() {
		this.#unsub?.()
		removePoolMembership(this.address)

		if (this.#poolId) {
			removeActivePoolId(this.#poolId)
		}
	}
}
