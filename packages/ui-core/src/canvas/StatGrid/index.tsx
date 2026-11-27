// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const StatGrid = ({ children, style }: ComponentBase) => (
	<div className={classes.grid} style={style}>
		{children}
	</div>
)

export const StatCard = ({
	children,
	style,
	title,
}: ComponentBase & { title: ReactNode }) => (
	<div className={classes.card} style={style}>
		<h4>{title}</h4>
		{children}
	</div>
)
