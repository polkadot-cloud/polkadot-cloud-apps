// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { CanvasSize, ComponentBase } from 'types'
import classes from './index.module.scss'

export const Main = ({
	children,
	style,
	size,
	withMenu,
}: ComponentBase & {
	size?: CanvasSize
	withMenu?: boolean
}) => {
	const allClasses = classNames(classes.main, {
		[classes.withMenu]: !!withMenu,
		[classes.lg]: size === 'lg',
		[classes.xl]: size === 'xl',
	})

	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
