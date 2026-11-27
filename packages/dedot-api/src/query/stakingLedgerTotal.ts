// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { StakingChain } from '../types'

export const stakingLedgerTotal = async <T extends StakingChain>(
	api: DedotClient<T>,
	stash: string,
): Promise<bigint | null> => {
	const controller = await api.query.staking.bonded(stash)
	if (!controller) return null

	const ledger = await api.query.staking.ledger(controller)
	return ledger?.total ?? null
}
