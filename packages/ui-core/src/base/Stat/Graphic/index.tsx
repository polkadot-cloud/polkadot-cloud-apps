// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Graphic
 * @summary Used to house a graphic in a `StatCard`
 */
export const Graphic = ({ children, style }: ComponentBase) => (
	<div className={classes.graphic} style={style}>
		{children}
	</div>
)
