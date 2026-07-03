// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction, AnyJson, DisplayFor } from 'types'
import type { SelectHandler } from '../types'

export interface InlineControlsProps {
	setters: AnyFunction[]
	displayFor: DisplayFor
	allowRevert: boolean
}

export interface ListControlsProps {
	selectHandlers: Record<string, SelectHandler>
	filterHandlers: AnyJson[]
	displayFor: DisplayFor
}

export interface MenuControlsProps {
	setters: AnyFunction[]
	allowRevert: boolean
}
