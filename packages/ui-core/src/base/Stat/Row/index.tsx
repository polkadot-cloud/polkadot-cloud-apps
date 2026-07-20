// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Row
 * @summary Used to house a row of `StatBox` items.
 */
export const Row = ({ children, style }: ComponentBase) => {
	const allClasses = classNames('pagePadding', classes.row)

	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
