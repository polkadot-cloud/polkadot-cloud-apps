// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBaseWithClassName } from 'types'
import classes from './index.module.scss'

export const Container = ({
	position,
	yMargin,
	style,
	children,
}: ComponentBaseWithClassName & {
	position?: 'top' | 'bottom'
	yMargin?: boolean
}) => {
	const allClasses = classNames(classes.container, {
		[classes.top]: position === 'top',
		[classes.bottom]: position === 'bottom',
		[classes.yMargin]: yMargin,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
