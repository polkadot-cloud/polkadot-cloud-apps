// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

type Props = ComponentBase & {
	width: string | number
	height: string | number
	noSpacing?: boolean
}
export const GraphInner = forwardRef(
	(
		{ width, height, noSpacing, children, style }: Props,
		ref: ForwardedRef<HTMLDivElement | null>,
	) => {
		const allClasses = classNames(classes.graphInner, {
			[classes.spacing]: !noSpacing,
		})
		return (
			<div className={allClasses} style={{ width, height, ...style }} ref={ref}>
				<div className={classes.inner}>{children}</div>
			</div>
		)
	},
)

GraphInner.displayName = 'GraphInner'
