// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { HeaderButtonProps } from '../types'
import classes from './index.module.scss'

export const HeaderButton = ({
	children,
	style,
	outline,
	withText,
	noMargin,
}: HeaderButtonProps) => {
	const allClasses = classNames(classes.headerButton, {
		[classes.noMargin]: !!noMargin,
		[classes.text]: !!withText,
		[classes.outline]: !!outline,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
