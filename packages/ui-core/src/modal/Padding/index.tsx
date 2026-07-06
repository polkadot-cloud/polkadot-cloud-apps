// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import type { PaddingProps } from '../types'
import classes from './index.module.scss'

export const Padding = forwardRef(
	(
		{ children, style, verticalOnly, horizontalOnly }: PaddingProps,
		ref?: ForwardedRef<HTMLDivElement | null>,
	) => {
		const allClasses = classNames(classes.padding, {
			[classes.verticalOnly]: verticalOnly,
			[classes.horizontalOnly]: horizontalOnly,
		})
		return (
			<div ref={ref} className={allClasses} style={style}>
				{children}
			</div>
		)
	},
)

Padding.displayName = 'Padding'
