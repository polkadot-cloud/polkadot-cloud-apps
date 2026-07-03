// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export type BondFor = 'nominator' | 'pool'

export interface BondManagerProps {
	bondFor: BondFor
	isPreloading?: boolean
}

export interface BondConfig {
	active: bigint
	totalUnlocking: bigint
	totalUnlocked: bigint
	bondButtonsDisabled: boolean
	bondDisabled: boolean
	unbondDisabled: boolean
	showUnstakeButton: boolean
	unstakeDisabled: boolean
	unstakeModalKey: 'Unstake' | 'LeavePool'
	unstakeIcon: IconDefinition
	helpKey: 'Bonding' | 'Bonded in Pool'
}
