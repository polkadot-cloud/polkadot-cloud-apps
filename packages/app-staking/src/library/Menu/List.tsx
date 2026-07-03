// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMenu } from 'contexts/Menu'
import type { MenuItem } from 'contexts/Menu/types'
import { ItemWrapper } from './Wrappers'

export const MenuList = ({
	items,
	secondaryBg = false,
}: {
	items: MenuItem[]
	secondaryBg?: boolean
}) => {
	const { closeMenu } = useMenu()

	return (
		<>
			{items.map((item) => {
				const { icon, title, cb, disabled } = item

				return (
					<ItemWrapper
						key={`menu_item_${title}`}
						$secondaryBg={secondaryBg}
						disabled={disabled}
						onClick={() => {
							if (disabled) {
								return
							}
							cb()
							closeMenu()
						}}
					>
						{icon}
						<div className="title">{title}</div>
					</ItemWrapper>
				)
			})}
		</>
	)
}
