// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { AnyFunction } from 'types'
import type { FilterHandler } from '../types'

export interface ListControlsProps {
	filterHandlers: FilterHandler[]
	disabled?: boolean
}

export interface MenuControlsProps {
	children?: ReactNode
	setters: AnyFunction[]
	allowRevert: boolean
	action?: ReactNode
	disabled?: boolean
	optimalSelectionOnly?: boolean
}
