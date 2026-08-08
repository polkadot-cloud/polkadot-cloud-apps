// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { useState } from 'react'
import type {
	ListContextInterface,
	ListProviderProps,
	SelectableListItem,
} from './types'

export const [ListContext, useList] = createSafeContext<ListContextInterface>()

export const ListProvider = ({
	selectable: initialSelectable = false,
	children,
	initialListFormat = 'col',
}: ListProviderProps) => {
	// Current page
	const [page, setPage] = useState(1)

	// Store the currently selected validators from the list.
	const [selected, setSelected] = useState<SelectableListItem[]>([])

	// Store whether validator selection is active
	const [selectable] = useState(initialSelectable)

	// Store the list format of the list
	const [listFormat, setListFormat] = useState(initialListFormat)

	const addToSelected = (item: SelectableListItem) => {
		setSelected((current) => [...current, item])
	}

	const removeFromSelected = (items: SelectableListItem[]) => {
		setSelected((current) => current.filter((item) => !items.includes(item)))
	}

	const resetSelected = () => {
		setSelected([])
	}

	return (
		<ListContext.Provider
			value={{
				addToSelected,
				removeFromSelected,
				resetSelected,
				setListFormat,
				selected,
				selectable,
				listFormat,
				pagination: {
					page,
					setPage,
				},
			}}
		>
			{children}
		</ListContext.Provider>
	)
}
