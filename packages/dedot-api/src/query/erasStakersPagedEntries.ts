// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import { AccountId32 } from 'dedot/codecs'
import type { ErasStakersPagedEntries } from 'types'
import type { StakingChain } from '../types'

export const erasStakersPagedEntries = async <T extends StakingChain>(
	api: DedotClient<T>,
	era: number,
	validator: string,
): Promise<ErasStakersPagedEntries> => {
	const result = await api.query.staking.erasStakersPaged.entries(
		era,
		new AccountId32(validator),
	)

	return result.map(([key, value]) => [
		[key[0], key[1].address(api.consts.system.ss58Prefix), key[2]],
		{
			pageTotal: value.pageTotal,
			others: value.others.map((other) => ({
				...other,
				who: other.who.address(api.consts.system.ss58Prefix),
			})),
		},
	])
}
