// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Cell = ({
	children,
	scope,
	style,
}: ComponentBase & { scope?: 'col' | 'row' }) => {
	const Element = scope ? 'th' : 'td'

	return (
		<Element className={classes.cell} scope={scope} style={style}>
			{children}
		</Element>
	)
}
