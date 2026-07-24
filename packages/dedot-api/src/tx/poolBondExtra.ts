// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { PalletNominationPoolsBondExtra } from 'dedot/chaintypes'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolBondExtra = <T extends StakingChain>(
	api: DedotClient<T>,
	type: 'FreeBalance' | 'Rewards',
	bond: bigint = 0n,
) => {
	const extra: PalletNominationPoolsBondExtra =
		type === 'FreeBalance'
			? {
					type,
					value: bond,
				}
			: { type: 'Rewards' }
	return asTx(api.tx.nominationPools.bondExtra(extra))
}
