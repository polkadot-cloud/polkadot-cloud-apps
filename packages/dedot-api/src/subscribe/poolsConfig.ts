// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import { defaultPoolsConfig, setPoolsConfig } from 'global-bus'
import type { PoolsConfig } from 'types'
import type { StakingChain } from '../types'

export class PoolsConfigQuery<T extends StakingChain> {
	poolsConfig: PoolsConfig = defaultPoolsConfig

	#unsub: Unsub | undefined = undefined

	constructor(public api: DedotClient<T>) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.queryMulti(
			[
				{
					fn: this.api.query.nominationPools.counterForPoolMembers,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.counterForBondedPools,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.counterForRewardPools,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.lastPoolId,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.maxPoolMembers,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.maxPoolMembersPerPool,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.maxPools,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.minCreateBond,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.minJoinBond,
					args: [],
				},
				{
					fn: this.api.query.nominationPools.globalMaxCommission,
					args: [],
				},
			],
			([
				counterForPoolMembers,
				counterForBondedPools,
				counterForRewardPools,
				lastPoolId,
				maxPoolMembers,
				maxPoolMembersPerPool,
				maxPools,
				minCreateBond,
				minJoinBond,
				globalMaxCommission,
			]) => {
				this.poolsConfig = {
					counterForPoolMembers,
					counterForBondedPools,
					counterForRewardPools,
					lastPoolId,
					maxPoolMembers,
					maxPoolMembersPerPool,
					maxPools,
					minCreateBond,
					minJoinBond,
					globalMaxCommission: globalMaxCommission || 0,
				}
				setPoolsConfig(this.poolsConfig)
			},
		)
	}

	unsubscribe() {
		this.#unsub?.()
	}
}
