// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Empty = ({ style, children }: ComponentBase) => (
	<div className={classes.empty} style={style}>
		{children}
	</div>
)
