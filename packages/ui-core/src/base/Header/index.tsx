// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBaseWithClassName } from 'types'
import classes from './index.module.scss'

export const Header = ({
	children,
	style,
	minimized,
	standalone,
}: ComponentBaseWithClassName & {
	minimized?: boolean
	standalone?: boolean
}) => {
	const allClasses = classNames(classes.header, {
		[classes.minimized]: !!minimized,
		[classes.standalone]: !!standalone,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
