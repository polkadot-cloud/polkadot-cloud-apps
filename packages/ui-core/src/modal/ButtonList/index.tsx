// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBaseWithClassName } from 'types'
import classes from './index.module.scss'

export const ButtonList = ({
	children,
	style,
	forceHeight,
}: ComponentBaseWithClassName & {
	forceHeight?: boolean
}) => {
	const allClasses = classNames(classes.btnList, {
		[classes.forceHeight]: !!forceHeight,
	})
	return (
		<div className={allClasses} style={style}>
			<div className={classes.inner}>{children}</div>
		</div>
	)
}
