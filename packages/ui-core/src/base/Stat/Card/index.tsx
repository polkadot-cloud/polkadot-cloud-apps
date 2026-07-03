// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Card
 * @summary Used to house a Stat item within a `Stat.Row`.
 */
export const Card = ({ children, style }: ComponentBase) => (
	<div className={classes.card} style={style}>
		{children}
	</div>
)

/**
 * @name Button
 * @summary Used to house a Stat item as a button within a `Stat.Row`.
 */
export const Button = ({ children, style }: ComponentBase) => {
	const allClasses = classNames(classes.card, classes.button)

	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
