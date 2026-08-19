// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import type { ValidatorRetainmentResult } from 'plugin-staking-api/types'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type {
	AnyFunction,
	AnyJson,
	DisplayFor,
	NominationSelection,
	Validator,
} from 'types'

export interface GenerateNominationsProps {
	setters: AnyFunction[]
	canManageNominations?: boolean
	displayFor?: DisplayFor
	eligibilityLoading?: boolean
	menuControls?: ReactNode
	standaloneCards?: boolean
}

export interface NominationsViewProps {
	canManageNominations: boolean
	displayFor: DisplayFor
	eligibilityLoading: boolean
	filterHandlers: FilterHandler[]
	menuControls?: ReactNode
	selectHandler: SelectHandler
	standaloneCards: boolean
}

export interface ConfirmActionProps {
	align?: 'start' | 'center' | 'end'
	children: ReactNode
	controlKey: string
	disabled?: boolean
	onConfirm: () => void
	text: string
}

export interface ConnectProps {
	status?: 'disconnected' | 'notStaking'
}

export interface MethodsProps {
	setMethod: Dispatch<SetStateAction<string | null>>
	setNominations: Dispatch<SetStateAction<Validator[]>>
	setFetching: Dispatch<SetStateAction<boolean>>
}

export interface NominationHealthProps {
	allValidatorsWaiting: boolean
	isLoading: boolean
	retainmentByAddress: ReadonlyMap<string, ValidatorRetainmentResult | null>
	standalone?: boolean
	validators: Validator[]
}

export interface RevertProps {
	disabled: boolean
	onClick: () => void
}

export interface StandaloneStyleProps {
	$standalone?: boolean
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
	popover: {
		node: React.FC<AnyJson>
		text: string
		callback: (args: { selected: Validator[]; callback?: AnyFunction }) => void
	}
}

export interface FilterHandler {
	title: string
	onClick: () => void
	isDisabled: () => boolean
	icon?: IconDefinition
}

export interface PromptProps {
	callback: (newNominations: Validator[]) => void
	nominations: Validator[]
}
