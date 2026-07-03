// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChangeEvent, ChangeEventHandler, FocusEventHandler } from 'react'
import type { ComponentBase } from 'types'

export interface TokenInputProps {
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
	placeholder: string
	value: string
	marginY?: boolean
	id: string
	label: string
}

export interface SwitchProps {
	checked: boolean
}

export type AccountInputProps = ComponentBase & {
	placeholder: string
	value: string
	onChange: ChangeEventHandler<HTMLInputElement>
	onFocus: FocusEventHandler<HTMLInputElement>
	onBlur: FocusEventHandler<HTMLInputElement>
	disabled?: boolean
}
