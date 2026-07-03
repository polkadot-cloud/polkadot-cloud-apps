// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface GroupsProps {
	activeGroup: number
	addressGroups: number[]
	canAddGroup: boolean
	onGroupChange: (group: number) => void
	onAddGroup: () => void
}
