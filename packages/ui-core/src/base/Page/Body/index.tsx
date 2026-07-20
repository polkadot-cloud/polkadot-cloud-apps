// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Body
 * @summary An element that houses Side and Main.
 */
export const Body = ({
	children,
	style,
	id,
}: ComponentBase & {
	id?: string
}) => (
	<div className={classes.body} style={style} id={id}>
		{children}
	</div>
)
