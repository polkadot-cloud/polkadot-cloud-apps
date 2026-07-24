// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { CombinedPoolReward, NominatorReward, PoolReward } from './types'

export const isPoolReward = (
	p: PoolReward | NominatorReward,
): p is PoolReward => 'poolId' in p

export const isPoolShareReward = (
	p: PoolReward | NominatorReward,
): p is CombinedPoolReward => {
	const source = isPoolReward(p) ? p.source?.toLowerCase() : undefined
	return source === 'share'
}

export const isNominatorReward = (
	p: PoolReward | NominatorReward,
): p is NominatorReward => !isPoolReward(p)
