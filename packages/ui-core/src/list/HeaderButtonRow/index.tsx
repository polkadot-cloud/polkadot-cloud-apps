// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { LabelRowProps } from '../types'
import classes from './index.module.scss'

export const HeaderButtonRow = ({ children, style, inline }: LabelRowProps) => {
	const allClasses = classNames(classes.headerButtonRow, {
		[classes.inline]: !!inline,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
