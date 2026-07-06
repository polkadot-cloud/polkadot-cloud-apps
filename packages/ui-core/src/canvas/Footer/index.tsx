// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { CanvasSize, ComponentBase } from 'types'
import classes from './index.module.scss'

export const Footer = ({
	children,
	style,
	size,
}: ComponentBase & {
	size?: CanvasSize
}) => {
	const allClasses = classNames(classes.footer, {
		[classes.lg]: size === 'lg',
		[classes.xl]: size === 'xl',
	})

	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
