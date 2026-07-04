// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import type { FixedTitleProps } from '../types'
import classes from './index.module.scss'

export const FixedTitle = forwardRef(
	(
		{ children, style, withStyle }: FixedTitleProps,
		ref?: ForwardedRef<HTMLDivElement>,
	) => {
		const allClasses = classNames(classes.fixedTitle, {
			[classes.withStyle]: withStyle,
		})
		return (
			<div ref={ref} className={allClasses} style={style}>
				{children}
			</div>
		)
	},
)
FixedTitle.displayName = 'FixedTitle'
