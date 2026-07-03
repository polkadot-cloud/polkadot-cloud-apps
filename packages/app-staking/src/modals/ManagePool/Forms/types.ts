// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, SetStateAction } from 'react'

export interface ChangeRateInput {
	years: number
	months: number
	days: number
	hours: number
	minutes: number
}

export interface FormsProps {
	setSection: Dispatch<SetStateAction<number>>
	task?: string
	section: number
	incrementCalculateHeight: () => void
	onResize: () => void
}
