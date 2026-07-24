// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { ErasStakersOverviewEntries } from 'types'
import type { StakingChain } from '../types'

export const erasStakersOverviewEntries = async <T extends StakingChain>(
	api: DedotClient<T>,
	era: number,
): Promise<ErasStakersOverviewEntries> => {
	const result = await api.query.staking.erasStakersOverview.entries(era)

	return result.map(([key, value]) => [
		[key[0], key[1].address(api.consts.system.ss58Prefix)],
		value,
	])
}
