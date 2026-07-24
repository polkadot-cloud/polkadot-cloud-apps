// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PoolsConfig } from 'types'

export const defaultPoolsConfig: PoolsConfig = {
	counterForPoolMembers: 0,
	counterForBondedPools: 0,
	counterForRewardPools: 0,
	lastPoolId: 0,
	maxPoolMembers: undefined,
	maxPoolMembersPerPool: undefined,
	maxPools: undefined,
	minCreateBond: 0n,
	minJoinBond: 0n,
	globalMaxCommission: 0,
}
