// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { CSSProperties, ReactNode } from 'react'
import classes from './index.module.scss'

export const Padding = ({
	flex,
	children,
	vOnly,
	hOnly,
	style,
}: {
	flex?: boolean
	children: ReactNode
	vOnly?: boolean
	hOnly?: boolean
	style?: CSSProperties
}) => {
	const allClasses = classNames(classes.padding, {
		[classes.vOnly]: !!vOnly,
		[classes.hOnly]: !!hOnly,
	})

	return (
		<div
			className={allClasses}
			style={{ ...style, display: flex ? 'flex' : 'block' }}
		>
			{children}
		</div>
	)
}
