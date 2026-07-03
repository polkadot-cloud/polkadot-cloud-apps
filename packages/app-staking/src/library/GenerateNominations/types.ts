// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import type {
	AnyFunction,
	AnyJson,
	DisplayFor,
	NominationSelection,
	Validator,
} from 'types'

export interface GenerateNominationsProps {
	setters: AnyFunction[]
	displayFor?: DisplayFor
	allowRevert?: boolean
}

export type NominationSelectionWithResetCounter = NominationSelection & {
	reset: number
}

export type AddNominationsType =
	| 'High Performance Validator'
	| 'Active Validator'
	| 'Random Validator'

export interface SelectHandler {
	title: string
	onSelected: boolean
	isDisabled: () => boolean
	popover: {
		node: React.FC<AnyJson>
		text: string
		callback: (args: { selected: AnyJson[]; callback?: AnyFunction }) => void
	}
}

export interface FilterHandler {
	title: string
	onClick: () => void
	onSelected: boolean
	isDisabled: () => boolean
	icon?: IconDefinition
}

export type FilterHandlers = Record<string, FilterHandler>

export interface PromptProps {
	callback: (newNominations: Validator[]) => void
	nominations: Validator[]
}

export interface RevertPromptProps {
	onRevert: () => void
}
