// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import classes from './index.module.scss'

export const Label = ({ children }: { children: ReactNode }) => (
	<h3 className={classes.label}>{children}</h3>
)
