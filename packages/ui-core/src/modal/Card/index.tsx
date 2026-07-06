// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import type { CardProps } from '../types'
import classes from './index.module.scss'

export const Card = forwardRef(
	(
		{ children, dimmed, style }: CardProps,
		ref?: ForwardedRef<HTMLDivElement | null>,
	) => {
		const allClasses = classNames(classes.card, {
			[classes.dimmed]: dimmed,
		})
		return (
			<div ref={ref} className={allClasses} style={style}>
				{children}
			</div>
		)
	},
)

Card.displayName = 'Card'
