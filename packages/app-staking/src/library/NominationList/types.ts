// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorListEntry } from 'contexts/Validators/types'
import type { ValidatorEraPoints } from 'plugin-staking-api/types'
import type {
	BondFor,
	DisplayFor,
	MaybeAddress,
	NominationStatus,
	Validator,
} from 'types'

export interface NominationListProps {
	validators: Validator[]
	bondFor: BondFor
	generateMethod?: string
	nominator?: MaybeAddress
	allowFilters?: boolean
	toggleFavorites?: boolean
	title?: string
	displayFor?: DisplayFor
}

export interface ItemProps {
	validator: ValidatorListEntry
	nominator: MaybeAddress
	bondFor: BondFor
	displayFor: DisplayFor
	toggleFavorites?: boolean
	nominationStatus?: NominationStatus
	eraPoints: ValidatorEraPoints[]
	rate?: number
}
