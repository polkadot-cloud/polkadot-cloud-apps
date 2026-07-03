// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { CSSProperties, ReactNode } from 'react'
import classes from './index.module.scss'

export const List = ({
	children,
	style,
}: {
	children: ReactNode
	style?: CSSProperties
}) => {
	return (
		<div className={classes.list} style={{ ...style }}>
			{children}
		</div>
	)
}
