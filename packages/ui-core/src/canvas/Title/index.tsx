// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Title = ({
	children,
	style,
	fullWidth,
}: ComponentBase & {
	fullWidth?: boolean
}) => {
	const allClasses = classNames(classes.title, {
		[classes.fullWidth]: !!fullWidth,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
