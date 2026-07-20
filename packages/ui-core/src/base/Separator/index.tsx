// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Separator
 * @summary A horizontal spacer with a bottom border. General spacer for separating content by row.
 */
export const Separator = ({
	children,
	style,
	transparent,
	lg,
}: ComponentBase & { transparent?: boolean; lg?: boolean }) => {
	const allClasses = classNames(classes.separator, {
		[classes.transparent]: !!transparent,
		[classes.lg]: !!lg,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
