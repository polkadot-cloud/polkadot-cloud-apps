// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Root = ({
	children,
	label,
	style,
}: ComponentBase & { label: string }) => (
	<div className={classes.root}>
		<table aria-label={label} className={classes.table} style={style}>
			{children}
		</table>
	</div>
)
