// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { type MenuItem, useMenu } from 'hooks/useMenu'
import { Fragment } from 'react'
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
			{items.map((item, index) => {
				const { icon, title, cb, disabled, separatorBefore } = item
				const endsGroup = items[index + 1]?.separatorBefore === true
				const classesForItem = [
					itemClassName,
					endsGroup ? classes.groupEnd : undefined,
				]
					.filter(Boolean)
					.join(' ')

				return (
					<Fragment key={`menu_item_${title}`}>
						{separatorBefore && <hr className={classes.separator} />}
						<button
							type="button"
							className={classesForItem}
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
					</Fragment>
				)
			})}
		</>
	)
}
