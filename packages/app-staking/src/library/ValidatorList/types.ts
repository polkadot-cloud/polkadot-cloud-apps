// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ListContextInterface } from 'contexts/List/types'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import type { ValidatorEraPoints } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import type {
	BondFor,
	DisplayFor,
	MaybeAddress,
	NominationStatus,
	Validator,
} from 'types'

export interface ValidatorListDefaultFilters {
	includes?: string[]
	excludes?: string[]
}

export interface ValidatorListProps {
	validators: Validator[]
	bondFor: BondFor
	allowMoreCols?: boolean
	generateMethod?: string
	nominator?: MaybeAddress
	allowFilters?: boolean
	toggleFavorites?: boolean
	itemsPerPage?: number
	title?: string
	selectable?: boolean
	onSelected?: (listProvider: ListContextInterface) => void
	displayFor?: DisplayFor
	allowSearch?: boolean
	allowListFormat?: boolean
	defaultFilters?: ValidatorListDefaultFilters
	defaultOrder?: string
	BeforeListNode?: ReactNode
	onRemove?: (params: {
		selected: Validator[]
		resetSelection?: () => void
	}) => void
}

export interface ItemProps {
	validator: ValidatorListEntry
	bondFor: BondFor
	displayFor: DisplayFor
	nominator: MaybeAddress
	format?: string
	toggleFavorites?: boolean
	nominationStatus?: NominationStatus
	eraPoints: ValidatorEraPoints[]
	rate?: number
	onRemove?: (params: {
		selected: Validator[]
		resetSelection?: () => void
	}) => void
}
