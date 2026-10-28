// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import type { ReactNode } from 'react'
import type { DisplayFor } from 'types'
import type { DropdownOption } from '../Dropdown/types'

export type BalanceInputValue = BigNumber | string

type SharedBalanceInputProps = {
	value: string
	maxAvailable: BalanceInputValue
	// Whether clicking the available balance can fill the input.
	allowMax?: boolean
	disabled?: boolean
	syncing?: boolean
	label?: string
	ariaLabel?: string
	displayFor?: DisplayFor
	maxDecimals: number
	onBlur?: () => void
}

type BalanceInputInteractionProps =
	| { readOnly?: false; onChange: (value: string) => void }
	| { readOnly: true; onChange?: never }

export type BalanceInputProps = Omit<SharedBalanceInputProps, 'maxDecimals'> &
	BalanceInputInteractionProps

export type BalanceInputMultiProps<T extends string> = SharedBalanceInputProps &
	BalanceInputInteractionProps & {
		options: DropdownOption<T>[]
		selected: DropdownOption<T>
		onSelect: (option: DropdownOption<T>) => void
	}

export type BalanceInputControlProps = Omit<
	SharedBalanceInputProps,
	'maxAvailable'
> &
	BalanceInputInteractionProps & {
		unit: string
		maxAvailable: BigNumber
		leading?: ReactNode
		trailing?: ReactNode
	}
