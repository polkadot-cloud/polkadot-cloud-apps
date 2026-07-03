// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, ReactNode, SetStateAction } from 'react'

export type ListFormat = 'row' | 'col'

// Type for items that can be selected in lists (validators, pools, etc.)
export type SelectableListItem = unknown

export interface ListContextInterface {
	addToSelected: (item: SelectableListItem) => void
	removeFromSelected: (items: SelectableListItem[]) => void
	resetSelected: () => void
	setListFormat: (v: ListFormat) => void
	selected: SelectableListItem[]
	selectable: boolean
	listFormat: ListFormat
	pagination: {
		page: number
		setPage: Dispatch<SetStateAction<number>>
	}
}

export interface ListProviderProps {
	selectable?: boolean
	children: ReactNode
}
