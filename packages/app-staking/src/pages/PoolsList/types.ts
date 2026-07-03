// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface PoolsTabsContextInterface {
	setActiveTab: (t: number) => void
	activeTab: number
}
