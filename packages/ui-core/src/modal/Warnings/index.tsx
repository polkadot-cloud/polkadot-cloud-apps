// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Warnings = ({ children, style }: ComponentBase) => (
	<div className={classes.warnings} style={style}>
		{children}
	</div>
)
