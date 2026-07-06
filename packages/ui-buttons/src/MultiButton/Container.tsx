// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import commonClasses from '../common.module.scss'
import type { MultiButtonContainerProps } from '../types'
import classes from './index.module.scss'

export const Container = ({
	children,
	style,
	marginLeft,
	marginRight,
	marginX,
	disabled,
}: MultiButtonContainerProps) => {
	const allClasses = classNames(classes.multiButton, {
		[classes.disabled]: !!disabled,
		[commonClasses.btnSpacingLeft]: marginLeft,
		[commonClasses.btnSpacingRight]: marginRight,
		[commonClasses.btnMarginX]: marginX,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
