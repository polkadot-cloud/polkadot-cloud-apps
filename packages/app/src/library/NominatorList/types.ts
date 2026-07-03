// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface NominatorListItemData {
	address: string
	label: string
	stakedBalance: number
	validatorApy: number
	incomingPayouts30d: number
	performance30d: number[]
}

export interface NominatorListProps {
	items: NominatorListItemData[]
	unit: string
}

export interface NominatorListItemProps {
	item: NominatorListItemData
	unit: string
}

export interface VerticalPayoutPerformanceProps {
	amounts: number[]
	tooltipText?: string
}
