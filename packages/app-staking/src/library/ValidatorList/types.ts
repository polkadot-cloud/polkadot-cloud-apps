// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ListContextInterface, ListFormat } from 'contexts/List/types'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import type { ValidatorListConfig } from 'library/StakingApiValidatorList/Controls'
import type {
	ValidatorEraPoints,
	ValidatorRetainmentResult,
} from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import type { BondFor, DisplayFor, MaybeAddress, Validator } from 'types'

export interface ValidatorListProps {
	validators: Validator[]
	bondFor: BondFor
	generateMethod?: string
	nominator?: MaybeAddress
	toggleFavorites?: boolean
	itemsPerPage?: number
	title?: string
	selectable?: boolean
	onSelected?: (listProvider: ListContextInterface) => void
	displayFor?: DisplayFor
	allowListFormat?: boolean
	forceListFormat?: ListFormat
	defaultConfig?: ValidatorListConfig
	BeforeListNode?: ReactNode
	onRemove?: (params: {
		selected: Validator[]
		resetSelection?: () => void
	}) => void
}

export interface ItemProps {
	validator: ValidatorListEntry
	displayFor: DisplayFor
	format: ListFormat
	toggleFavorites?: boolean
	eraPoints: ValidatorEraPoints[]
	rate?: number
	retainment?: ValidatorRetainmentResult | null
	isPreloading?: boolean
	onRemove?: (params: {
		selected: Validator[]
		resetSelection?: () => void
	}) => void
}
