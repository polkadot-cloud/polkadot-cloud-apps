// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchEraActiveNominatorCount } from 'plugin-staking-api'
import { useEraStakersQuery } from '../eraStakers'
import { requestOptions } from '../eraStakers/requestOptions'

// The number of unique nominator accounts backing validators in the active era. Each account counts
// once, even if its stake backs multiple validators.
export const useEraNominatorCount = (enabled = true) =>
	useEraStakersQuery({
		enabled,
		key: ['nominator-count'],
		node: (exposures) => {
			// Count unique nominator accounts: an account backing three validators counts as one.
			const nominators = new Set<string>()
			for (const {
				val: { others },
			} of exposures) {
				for (const { who } of others) nominators.add(who)
			}
			return nominators.size
		},
		stakingApi: async ({ network, signal }, era) => {
			const { eraActiveNominatorCount: count } =
				await fetchEraActiveNominatorCount(network, era, requestOptions(signal))
			if (!Number.isInteger(count) || count < 0) {
				throw new Error('Staking API returned an invalid nominator count')
			}
			return count
		},
	})
