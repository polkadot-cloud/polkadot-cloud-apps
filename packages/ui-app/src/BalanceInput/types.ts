// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import type { ReactNode } from 'react'
import type { DisplayFor } from 'types'
import type { DropdownOption } from '../Dropdown/types'

export type BalanceInputSetter = ({
	value,
	inputValue,
}: {
	value: BigNumber
	inputValue?: string
}) => void
export type BalanceInputValue = BigNumber | string

type SharedBalanceInputProps = {
	value: string
	maxAvailable: BalanceInputValue
	disabled?: boolean
	syncing?: boolean
	label?: string
	ariaLabel?: string
	displayFor?: DisplayFor
	maxDecimals: number
	onBlur?: () => void
}

export interface BalanceInputProps {
	maxAvailable: BalanceInputValue
	value: string
	defaultValue: string
	syncing?: boolean
	setters: BalanceInputSetter[]
	disabled: boolean
	disableTxFeeUpdate?: boolean
	label?: string
	ariaLabel?: string
	displayFor?: DisplayFor
}

export type BalanceInputMultiProps<T extends string> =
	SharedBalanceInputProps & {
		options: DropdownOption<T>[]
		selected: DropdownOption<T>
		onSelect: (option: DropdownOption<T>) => void
		onChange: (value: string) => void
	}

export type BalanceInputControlProps = {
	value: string
	unit: string
	maxAvailable: BigNumber
	maxDecimals: number
	disabled?: boolean
	syncing?: boolean
	label?: string
	ariaLabel?: string
	displayFor?: DisplayFor
	leading?: ReactNode
	trailing?: ReactNode
	multi?: boolean
	onChange: (value: string) => void
	onBlur?: () => void
}
