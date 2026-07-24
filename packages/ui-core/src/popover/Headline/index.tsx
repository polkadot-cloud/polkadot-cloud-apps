// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import classes from './index.module.scss'

export const Headline = ({
	title,
	value,
}: {
	title: ReactNode
	value: ReactNode
}) => {
	return (
		<div className={classes.headline}>
			<h2 className={classes.title}>{title}</h2>
			<span className={classes.value}>{value}</span>
		</div>
	)
}
