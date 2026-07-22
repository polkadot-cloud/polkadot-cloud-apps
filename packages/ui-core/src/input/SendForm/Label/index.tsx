// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import classes from './index.module.scss'

export type SendFormLabelProps = {
	label: string
	children: ReactNode
}

export const Label = ({ label, children }: SendFormLabelProps) => (
	<span className={classes.label}>
		{label}: <span className={classes.value}>{children}</span>
	</span>
)
