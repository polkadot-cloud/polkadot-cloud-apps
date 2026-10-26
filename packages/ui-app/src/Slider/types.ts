// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// A controlled numeric slider with an accessible label and optional value formatting.
export interface SliderProps {
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	step: number
	disabled?: boolean
	ariaLabel: string
	formatValue?: (value: number) => string
}
