// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { CSSProperties, ReactNode } from 'react'
import classes from './index.module.scss'

export const Heading = ({
	children,
	style,
	border,
}: {
	children: ReactNode
	style?: CSSProperties
	border?: boolean
}) => {
	const allClasses = classNames(classes.heading, {
		[classes.border]: border,
	})
	return (
		<div className={allClasses} style={{ ...style }}>
			{children}
		</div>
	)
}
