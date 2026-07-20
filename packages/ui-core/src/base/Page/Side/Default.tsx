// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import classes from './index.module.scss'
import type { SideProps } from './types'

export const Default = ({
	style,
	open,
	minimised,
	nav,
	bar,
	transparent,
}: SideProps) => {
	const classses = classNames(classes.nav, classes.default, {
		[classes.hidden]: !open,
		[classes.minimised]: minimised,
		[classes.transparent]: !!transparent,
	})

	const barClasses = classNames(classes.bar, {
		[classes.transparent]: !!transparent,
	})

	return (
		<div className={classes.container}>
			{bar && <div className={barClasses}>{bar}</div>}
			<div style={{ ...style }} className={classses}>
				{nav}
			</div>
		</div>
	)
}
