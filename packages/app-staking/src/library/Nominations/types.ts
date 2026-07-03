// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ListFormat } from 'contexts/List/types'
import type { BondFor, Validator } from 'types'

export interface ManageNominationsInterface {
	addToSelected: (item: Validator) => void
	removeFromSelected: (item: Validator) => void
	setListFormat: (format: ListFormat) => void
	resetSelected: () => void
	selected: Validator[]
	listFormat: ListFormat
	selectTogglable: boolean
}

export interface NominationsEmptyProps {
	bondFor: BondFor
	nominator: string | null
	nominated: Validator[]
	disabled?: boolean
	title?: string
}
