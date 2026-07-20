// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const TokenFiat = ({
	children,
	style,
	Token,
}: ComponentBase & {
	Token: ReactNode
}) => (
	<div className={classes.tokenFiat} style={style}>
		<div>{Token}</div>
		<div>{children}</div>
	</div>
)
