// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorSupportedNetwork } from '@w3ux/validator-assets'
import type { Dispatch, SetStateAction } from 'react'

export interface ItemProps {
	item: Item
	actionable: boolean
	network: ValidatorSupportedNetwork
}

export interface Item {
	bio?: string
	name: string
	email?: string
	x?: string
	website?: string
	icon: string
	validators: Partial<{
		[K in ValidatorSupportedNetwork]: string[]
	}>
}

export interface OperatorsSectionsContextInterface {
	setActiveSection: (t: number) => void
	activeSection: number
	activeItem: Item
	setActiveItem: Dispatch<SetStateAction<Item>>
	scrollPos: number
	setScrollPos: Dispatch<SetStateAction<number>>
}
