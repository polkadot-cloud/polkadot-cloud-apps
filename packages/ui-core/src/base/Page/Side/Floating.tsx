// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import classes from './index.module.scss'
import type { FloatingMenuProps } from './types'

export const Floating = ({
	children,
	style,
	open,
	minimised,
}: FloatingMenuProps) => {
	const classses = classNames(classes.nav, classes.floating, {
		[classes.hidden]: !open,
		[classes.minimised]: minimised,
	})

	return (
		<div style={{ ...style }} className={classses}>
			{children}
		</div>
	)
}
