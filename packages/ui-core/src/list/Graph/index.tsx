// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { GraphProps } from '../types'
import classes from './index.module.scss'

export const Graph = ({
	children,
	style,
	syncing,
	canvas,
	Inner,
}: GraphProps) => {
	const allClasses = classNames(classes.graph, {
		[classes.canvas]: !!canvas,
	})
	return (
		<div className={allClasses} style={style}>
			{syncing && <div className={classes.preload} />}
			<div className={classes.inner}>{Inner}</div>
			{children}
		</div>
	)
}
