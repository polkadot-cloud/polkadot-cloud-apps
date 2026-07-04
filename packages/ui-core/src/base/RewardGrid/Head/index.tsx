// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import commonClasses from '../common.module.scss'
import classes from './index.module.scss'

export const Head = ({ children, style }: ComponentBase) => {
	const allClasses = classNames(commonClasses.row, classes.head)

	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
