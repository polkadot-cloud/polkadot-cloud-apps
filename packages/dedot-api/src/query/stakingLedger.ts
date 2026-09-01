// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { StakingChain } from '../types'

/** Returns the stash's actively bonded stake when it has no managed subscription. */
export const stakingLedgerActive = async <T extends StakingChain>(
	api: DedotClient<T>,
	address: string,
): Promise<bigint | undefined> => {
	const controller = await api.query.staking.bonded(address)
	if (controller === undefined) return undefined

	return (await api.query.staking.ledger(controller))?.active
}
