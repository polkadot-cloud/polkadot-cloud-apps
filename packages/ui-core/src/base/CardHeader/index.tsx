// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const CardHeader = ({
	children,
	style,
	action,
	margin,
}: ComponentBase & { action?: boolean; margin?: boolean }) => {
	const allClasses = classNames(classes.cardHeader, {
		[classes.action]: !!action,
		[classes.margin]: !!margin,
	})

	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
