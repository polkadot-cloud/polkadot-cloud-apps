// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, SetStateAction } from 'react'
import type { BondedPool, RoleIdentities } from 'types'

export interface HeaderProps {
	activeTab: number
	bondedPool: BondedPool
	metadata: string | undefined
	autoSelected: boolean
	setActiveTab: (tab: number) => void
}

export interface NominationsProps {
	stash: string
	poolId: number
}

export interface OverviewSectionProps {
	bondedPool: BondedPool
	roleIdentities: RoleIdentities | undefined
	poolCandidates: BondedPool[]
	setSelectedPoolId: Dispatch<SetStateAction<number>>
	providedPoolId: number
}
