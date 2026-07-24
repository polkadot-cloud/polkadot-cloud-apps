// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { PoolRoles } from 'types'
import type { StakingChain } from '../types'
import { asTxs } from '../util'

export const createPool = <T extends StakingChain>(
	api: DedotClient<T>,
	from: string,
	poolId: number,
	bond: bigint,
	metadata: string,
	nominees: string[],
	roles: PoolRoles | null,
) => {
	const root = roles?.root || from
	const nominator = roles?.nominator || from
	const bouncer = roles?.bouncer || from

	const txs = asTxs([
		api.tx.nominationPools.create(bond, root, nominator, bouncer),
		api.tx.nominationPools.nominate(poolId, nominees),
		api.tx.nominationPools.setMetadata(poolId, metadata),
	])
	return txs
}
