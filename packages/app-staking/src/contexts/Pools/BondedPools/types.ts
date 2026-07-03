// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, SetStateAction } from 'react'
import type { AnyJson, BondedPool, Nominator, PoolTab } from 'types'

export interface BondedPoolsContextState {
	queryBondedPool: (poolId: number) => Promise<BondedPool | undefined>
	getBondedPool: (poolId: number) => BondedPool | null
	updateBondedPools: (bondedPools: BondedPool[]) => void
	addToBondedPools: (bondedPool: BondedPool) => void
	removeFromBondedPools: (poolId: number) => void
	replacePoolRoles: (poolId: number, roleEdits: AnyJson) => void
	poolSearchFilter: (pools: BondedPool[], searchTerm: string) => BondedPool[]
	bondedPools: BondedPool[]
	poolsMetaData: Record<number, string>
	poolsNominations: Record<number, Nominator | undefined>
	updatePoolNominations: (id: number, nominations: string[]) => void
	poolListActiveTab: PoolTab
	setPoolListActiveTab: Dispatch<SetStateAction<PoolTab>>
}
