// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import classes from './index.module.scss'
import type { RowSectionProps } from './types'

/**
 * @name RowSection
 * @summary Container for primary and secondary modules in a PageRow.
 */
export const RowSection = ({
	children,
	style,
	vLast,
	hLast,
	secondary,
	standalone,
}: RowSectionProps) => {
	const mainClass = secondary ? classes.secondary : classes.primary
	const hClass = hLast ? classes.first : classes.last

	const rowClasses = classNames(mainClass, hClass, {
		[classes.vLast]: vLast,
		[classes.standalone]: standalone,
	})

	return (
		<div className={rowClasses} style={style}>
			{children}
		</div>
	)
}
