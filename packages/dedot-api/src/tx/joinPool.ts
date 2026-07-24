// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import { defaultClaimPermission } from 'global-bus'
import type { ClaimPermission } from 'types'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const joinPool = <T extends StakingChain>(
	api: DedotClient<T>,
	poolId: number,
	bond: bigint,
	claimPermission: ClaimPermission,
) => {
	const txs = [asTx(api.tx.nominationPools.join(bond, poolId))]
	if (claimPermission === defaultClaimPermission) {
		return [txs[0]]
	}
	txs.push(asTx(api.tx.nominationPools.setClaimPermission(claimPermission)))
	return txs
}
