// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Main
 * @summary A column flex wrapper that hosts the main page content.
 */
export const Main = forwardRef(
	({ children, style }: ComponentBase, ref?: ForwardedRef<HTMLDivElement>) => (
		<div className={classes.main} ref={ref} style={style}>
			{children}
		</div>
	),
)
Main.displayName = 'Main'
