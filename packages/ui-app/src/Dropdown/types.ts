// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type DropdownOption<T extends string = string> = {
	value: T
	label: string
	icon?: string
}

export type DropdownProps<T extends string> = {
	options: DropdownOption<T>[]
	selected: DropdownOption<T>
	onSelect: (option: DropdownOption<T>) => void
	variant?: 'compact' | 'full'
}
