// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import { toU8a } from 'dedot/utils'
import type { StakingChain } from '../types'

export class StakingConsts<T extends StakingChain> {
	bondDuration: number
	unbondDuration: number
	sessionsPerEra: number
	maxExposurePageSize: number
	historyDepth: number
	poolsPalletId: Uint8Array

	constructor(public api: DedotClient<T>) {
		this.api = api
	}

	async fetch() {
		this.bondDuration = this.api.consts.staking.bondingDuration
		this.sessionsPerEra = this.api.consts.staking.sessionsPerEra
		this.maxExposurePageSize = this.api.consts.staking.maxExposurePageSize
		this.historyDepth = this.api.consts.staking.historyDepth
		this.poolsPalletId = toU8a(this.api.consts.nominationPools.palletId)

		// Nominators and pools unbond in the fast unbond duration while nominator
		// slashing is disabled on-chain; otherwise the full bond duration applies.
		const fastUnbondDuration =
			this.api.consts.staking.nominatorFastUnbondDuration ?? this.bondDuration
		let nominatorsSlashable = true
		try {
			nominatorsSlashable =
				await this.api.query.staking.areNominatorsSlashable()
		} catch {
			// Storage item unavailable on this runtime; retain slashable default.
		}
		this.unbondDuration = nominatorsSlashable
			? this.bondDuration
			: fastUnbondDuration
	}

	get() {
		return {
			bondDuration: this.bondDuration,
			unbondDuration: this.unbondDuration,
			sessionsPerEra: this.sessionsPerEra,
			maxExposurePageSize: this.maxExposurePageSize,
			historyDepth: this.historyDepth,
			poolsPalletId: this.poolsPalletId,
		}
	}
}
