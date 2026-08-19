// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { AnyFunction, AnyJson, DisplayFor } from 'types'
import type { SelectHandler } from '../types'

export interface InlineControlsProps {
	displayFor: DisplayFor
}

export interface ListControlsProps {
	selectHandlers: Record<string, SelectHandler>
	filterHandlers: AnyJson[]
	displayFor: DisplayFor
	standalone?: boolean
}

export interface MenuControlsProps {
	setters: AnyFunction[]
	allowRevert: boolean
	action?: ReactNode
	disabled?: boolean
	optimalSelectionOnly?: boolean
}
