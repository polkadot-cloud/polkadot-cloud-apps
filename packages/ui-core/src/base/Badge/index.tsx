// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Container = ({
	children,
	style,
	format,
	hList,
	vList,
	styled,
	activeTransform,
}: ComponentBase & {
	format?: 'warning' | 'danger' | 'button'
	hList?: boolean
	vList?: boolean
	styled?: boolean
	activeTransform?: boolean
}) => {
	const allClasses = classNames(classes.container, {
		[classes.warning]: format === 'warning',
		[classes.danger]: format === 'danger',
		[classes.button]: format === 'button',
		[classes.styled]: !!styled,
		[classes.hList]: !!hList,
		[classes.vList]: !!vList,
	})

	const innerClasses = classNames(classes.inner, {
		[classes.warning]: format === 'warning',
		[classes.danger]: format === 'danger',
		[classes.activeTransform]: !!activeTransform,
		[classes.styled]: !!styled,
	})

	return (
		<span className={allClasses} style={style}>
			<div className={innerClasses}>{children}</div>
		</span>
	)
}

export const Inner = ({
	children,
	style,
	variant = 'primary',
}: ComponentBase & {
	variant?: 'primary' | 'secondary' | 'warning' | 'danger'
}) => (
	<span
		className={`${classes.badge} ${variant ? classes[variant] : ''}`}
		style={style}
	>
		{children}
	</span>
)

export const Badge = {
	Container,
	Inner,
}
