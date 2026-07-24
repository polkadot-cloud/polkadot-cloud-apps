// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { NominatorsMultiQuery } from 'types'
import type { StakingChain } from '../types'

export const nominatorsMulti = async <T extends StakingChain>(
	api: DedotClient<T>,
	addresses: string[],
): Promise<NominatorsMultiQuery> => {
	const result = await api.query.staking.nominators.multi(addresses)

	return result.map((value) =>
		value === undefined
			? undefined
			: {
					...value,
					targets: value.targets.map((target) =>
						target.address(api.consts.system.ss58Prefix),
					),
				},
	)
}
