// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Head = ({ children, style }: ComponentBase) => (
	<thead>
		<tr className={classes.head} style={style}>
			{children}
		</tr>
	</thead>
)
