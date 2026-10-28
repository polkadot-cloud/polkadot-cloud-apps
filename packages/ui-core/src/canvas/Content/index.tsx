// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import type { CanvasVariant } from '../types'
import classes from './index.module.scss'

export const Content = ({
	children,
	style,
	size,
	variant = 'default',
}: ComponentBase & {
	size?: 'lg' | 'xl'
	variant?: CanvasVariant
}) => {
	const allClasses = classNames(classes.content, {
		[classes.lg]: size === 'lg',
		[classes.xl]: size === 'xl',
		[classes.card]: variant === 'card',
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
