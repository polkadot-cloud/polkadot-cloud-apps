// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { type MenuItem, useMenu } from 'hooks/useMenu'
import classes from './index.module.scss'

export const MenuList = ({
	items,
	secondaryBg = false,
}: {
	items: MenuItem[]
	secondaryBg?: boolean
}) => {
	const { closeMenu } = useMenu()

	const itemClassName = [
		classes.itemWrapper,
		secondaryBg ? classes.secondaryBg : undefined,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<>
			{items.map((item) => {
				const { icon, title, cb, disabled } = item

				return (
					<button
						key={`menu_item_${title}`}
						type="button"
						className={itemClassName}
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
						<div className={classes.title}>{title}</div>
					</button>
				)
			})}
		</>
	)
}
