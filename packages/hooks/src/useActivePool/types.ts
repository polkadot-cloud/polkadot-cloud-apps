// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActivePool, Nominations, PoolRoles, PoolUnlocking } from 'types'

export interface ActivePoolHookInterface {
	inPool: boolean
	isBonding: boolean
	isNominator: () => boolean
	isOwner: () => boolean
	isMember: () => boolean
	isDepositor: () => boolean
	isBouncer: () => boolean
	getPoolUnlocking: () => PoolUnlocking[]
	getPoolRoles: () => PoolRoles
	activePool: ActivePool | undefined
	activePoolNominations: Nominations | null
}
