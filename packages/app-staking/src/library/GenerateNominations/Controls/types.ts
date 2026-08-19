// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { AnyFunction, DisplayFor } from 'types'
import type { FilterHandler, SelectHandler } from '../types'

export interface InlineControlsProps {
	displayFor: DisplayFor
}

export interface InlineControlsWrapperProps {
	$standalone?: boolean
}

export interface ListControlsProps {
	selectHandler: SelectHandler
	filterHandlers: FilterHandler[]
	standalone?: boolean
}

export interface MenuControlsProps {
	setters: AnyFunction[]
	allowRevert: boolean
	action?: ReactNode
	disabled?: boolean
	optimalSelectionOnly?: boolean
}
