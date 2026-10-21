// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PoolMember, PoolMembers } from 'plugin-staking-api/types'

export type FetchedPoolMember = Omit<PoolMember, 'points' | 'unbondingEras'> & {
	points: bigint
	unbondingEras: [number, bigint][]
}

export type FetchedPoolMembers = Omit<PoolMembers, 'members'> & {
	members: FetchedPoolMember[]
}
