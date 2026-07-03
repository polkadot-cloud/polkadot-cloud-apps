// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface StyledSliderProps {
	min?: number
	max?: number
	value: number
	step: number
	className?: string
	onChange: (val: number | number[]) => void
}
