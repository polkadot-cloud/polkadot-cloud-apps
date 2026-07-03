// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { BondedPool, DisplayFor } from 'types'

export interface PoolProps {
	pool: BondedPool
}

export interface RewardProps {
	address: string
	displayFor?: DisplayFor
}

export interface RewardsGraphProps {
	points: number[]
	syncing: boolean
}
