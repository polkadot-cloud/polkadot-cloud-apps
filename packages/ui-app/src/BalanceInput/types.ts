// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import type { ReactNode } from 'react'
import type { DisplayFor } from 'types'
import type { DropdownOption } from '../Dropdown/types'

export type BalanceInputValue = BigNumber | string

type SharedBalanceInputProps = {
	value: string
	onChange: (value: string) => void
	maxAvailable: BalanceInputValue
	disabled?: boolean
	syncing?: boolean
	label?: string
	ariaLabel?: string
	displayFor?: DisplayFor
	maxDecimals: number
	onBlur?: () => void
}

export type BalanceInputProps = Omit<SharedBalanceInputProps, 'maxDecimals'>

export type BalanceInputMultiProps<T extends string> =
	SharedBalanceInputProps & {
		options: DropdownOption<T>[]
		selected: DropdownOption<T>
		onSelect: (option: DropdownOption<T>) => void
	}

export type BalanceInputControlProps = Omit<
	SharedBalanceInputProps,
	'maxAvailable'
> & {
	unit: string
	maxAvailable: BigNumber
	leading?: ReactNode
	trailing?: ReactNode
}
