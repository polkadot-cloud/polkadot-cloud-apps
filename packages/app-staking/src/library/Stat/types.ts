// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { MaybeAddress } from 'types'

export interface StatButtonProps {
	id?: string
	title: string
	large?: boolean
	icon?: IconProp
	transform?: string
	disabled?: boolean
	onClick: () => void
}

export interface StatOdometerData {
	value: string
	unit?: string
}

export type StatData = string | StatAddress | StatOdometerData

export interface StatProps {
	label: string
	stat: StatData
	type?: string
	buttons?: StatButtonProps[]
	dimmed?: boolean
	helpKey?: string
	icon?: IconProp
	buttonType?: string
}

export interface StatAddress {
	address: MaybeAddress
	display: string
}
