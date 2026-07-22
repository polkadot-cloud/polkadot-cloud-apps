// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { ComponentBaseWithClassName } from 'types'
import classes from './index.module.scss'

export const MenuItem = ({
	children,
	padded,
}: {
	children: ReactNode
	padded?: boolean
}) => {
	const allClasses = classNames(classes.menuItem, {
		[classes.padded]: padded,
	})

	return <div className={allClasses}>{children}</div>
}

export const MenuItemButton = ({
	children,
	style,
	className,
	onClick,
	disabled,
}: ComponentBaseWithClassName & {
	children: ReactNode
	onClick: (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void
	disabled?: boolean
}) => {
	const allClasses = classNames(classes.menuItem, classes.button, className, {
		[classes.disabled]: disabled,
	})
	return (
		<button
			type="button"
			onClick={(e) => onClick(e)}
			className={allClasses}
			disabled={disabled}
			style={style}
		>
			{children}
		</button>
	)
}
