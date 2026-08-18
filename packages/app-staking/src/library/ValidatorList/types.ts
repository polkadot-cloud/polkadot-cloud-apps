// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ListFormat } from 'contexts/List/types'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import type { ValidatorListConfig } from 'library/StakingApiValidatorList/Controls'
import type {
	ValidatorEraPoints,
	ValidatorRetainmentResult,
} from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import type { DisplayFor, Validator } from 'types'

export interface RetainmentSummaryData {
	isLoading: boolean
	retainmentByAddress: ReadonlyMap<string, ValidatorRetainmentResult | null>
}

export interface ValidatorListProps {
	validators: Validator[]
	showShareLink?: boolean
	toggleFavorites?: boolean
	itemsPerPage?: number
	selectable?: boolean
	displayFor?: DisplayFor
	allowListFormat?: boolean
	forceListFormat?: ListFormat
	defaultConfig?: ValidatorListConfig
	BeforeListNode?: ReactNode
	renderRetainmentSummary?: (data: RetainmentSummaryData) => ReactNode
	onRemove?: (params: {
		selected: Validator[]
		resetSelection?: () => void
	}) => void
}

export interface ItemProps {
	validator: ValidatorListEntry
	displayFor: DisplayFor
	format: ListFormat
	showShareLink?: boolean
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
