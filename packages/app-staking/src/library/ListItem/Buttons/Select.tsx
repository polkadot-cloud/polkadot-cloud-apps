// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useList } from 'contexts/List'
import { Checkbox } from 'ui-core/list'
import type { SelectProps } from '../types'

export const Select = ({ item }: SelectProps) => {
	const { addToSelected, removeFromSelected, selected } = useList()
	const selectedItems = selected.filter(
		(selectedItem) =>
			(selectedItem as SelectProps['item']).address === item.address,
	)
	const isSelected = selectedItems.length > 0
	return (
		<Checkbox
			checked={isSelected}
			onClick={() => {
				if (isSelected) {
					removeFromSelected(selectedItems)
				} else {
					addToSelected(item)
				}
			}}
		/>
	)
}
