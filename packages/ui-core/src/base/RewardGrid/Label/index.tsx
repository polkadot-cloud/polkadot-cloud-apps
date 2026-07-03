// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Label = ({ children, style }: ComponentBase) => (
	<h3 className={classes.label} style={style}>
		{children}
	</h3>
)
