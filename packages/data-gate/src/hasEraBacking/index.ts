// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchGetNomineesInEra } from 'plugin-staking-api'
import type { MaybeAddress } from 'types'
import { useEraStakersQuery } from '../eraStakers'
import { requestOptions } from '../eraStakers/requestOptions'

// Whether a nominator or pool stash has stake backing any validator in the active era, including
// validators removed from its current nomination targets.
export const useHasEraBacking = (who: MaybeAddress) =>
	useEraStakersQuery({
		key: ['backing', who],
		enabled: !!who,
		node: (exposures) =>
			exposures.some(({ val: { others } }) =>
				others.some((other) => other.who === who),
			),
		stakingApi: async ({ network, signal }, era) => {
			const data = await fetchGetNomineesInEra(
				network,
				era,
				who!,
				requestOptions(signal),
			)
			if (!Array.isArray(data.getNomineesInEra)) {
				throw new Error('Staking API returned invalid era backing')
			}
			return data.getNomineesInEra.length > 0
		},
	})
