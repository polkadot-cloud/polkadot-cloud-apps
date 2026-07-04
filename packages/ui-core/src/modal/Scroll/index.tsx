// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import SimpleBar from 'simplebar-react'
import type { ScrollProps } from '../types'
import classes from './index.module.scss'

export const Scroll = forwardRef(
	(
		{ size, children, style, overflow }: ScrollProps,
		ref?: ForwardedRef<HTMLDivElement>,
	) => {
		const allClasses = classNames(classes.scroll, {
			[classes.xs]: size === 'xs',
			[classes.lg]: size === 'lg',
			[classes.xl]: size === 'xl',
		})
		return (
			<div ref={ref} className={allClasses} style={style}>
				<SimpleBar
					autoHide={true}
					style={{
						height: '100%',
						overflow,
					}}
				>
					{children}
				</SimpleBar>
			</div>
		)
	},
)
Scroll.displayName = 'Scroll'
