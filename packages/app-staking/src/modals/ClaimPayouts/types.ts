// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorUnclaimedReward } from 'plugin-staking-api/types'

export interface ItemProps {
	era: string
	validators: ValidatorUnclaimedReward[]
	setSection: (v: number) => void
	setPayouts: (payout: ActivePayout[] | null) => void
}

export interface ActivePayout {
	era: string
	payout: string
	paginatedValidators: [number, string][]
}

export interface OverviewProps {
	setSection: (s: number) => void
	setPayouts: (p: ActivePayout[] | null) => void
}

export interface FormProps {
	onResize: () => void
	setSection: (s: number) => void
	payouts: ActivePayout[] | null
	setPayouts: (p: ActivePayout[] | null) => void
}
