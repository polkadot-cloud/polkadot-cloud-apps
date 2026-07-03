// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'

export interface BondedChartProps {
	active: BigNumber
	free: BigNumber
	unlocking: BigNumber
	unlocked: BigNumber
	inactive: boolean
}

export interface NewNominatorProps {
	syncing: boolean
}
