// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Unsub } from 'dedot/types'
import {
	removeActivePoolId,
	removeStakingLedger,
	setStakingLedger,
} from 'global-bus'
import type { StakingLedger } from 'types'
import type { StakingChain } from '../types'

export class StakingLedgerQuery<T extends StakingChain> {
	#unsub: Unsub | undefined = undefined
	#poolId: number | undefined = undefined

	constructor(
		public api: DedotClient<T>,
		public address: string,
		public bonded: string,
	) {
		this.api = api
		this.subscribe()
	}

	async subscribe() {
		this.#unsub = await this.api.queryMulti(
			[
				{
					fn: this.api.query.staking.ledger,
					args: [this.bonded],
				},
				{
					fn: this.api.query.staking.payee,
					args: [this.address],
				},
				{
					fn: this.api.query.staking.nominators,
					args: [this.address],
				},
			],
			async ([ledger, payee, nominators]) => {
				const stakingLedger: StakingLedger = {
					ledger:
						ledger === undefined
							? undefined
							: {
									stash: ledger.stash.address(
										this.api.consts.system.ss58Prefix,
									),
									total: ledger.total,
									active: ledger.active,
									unlocking: ledger.unlocking.map(({ value, era }) => ({
										value,
										era,
									})),
								},
					payee:
						payee === undefined
							? undefined
							: {
									destination: payee.type,
									account:
										'value' in payee
											? payee.value.address(this.api.consts.system.ss58Prefix)
											: undefined,
								},
					nominators:
						nominators === undefined
							? {
									targets: [],
									submittedIn: 0,
								}
							: {
									targets: nominators.targets.map((target) =>
										target.address(this.api.consts.system.ss58Prefix),
									),
									submittedIn: nominators.submittedIn,
								},
					controllerUnmigrated: this.bonded !== this.address,
				}
				setStakingLedger(this.address, stakingLedger)
			},
		)
	}

	unsubscribe() {
		this.#unsub?.()
		removeStakingLedger(this.address)

		if (this.#poolId) {
			removeActivePoolId(this.#poolId)
		}
	}
}
