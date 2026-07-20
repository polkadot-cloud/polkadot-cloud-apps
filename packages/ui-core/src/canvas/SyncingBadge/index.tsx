// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import { Stat } from '../Stat'
import classes from './index.module.scss'

export const SyncingBadge = ({
	percentPassed,
	title,
	style,
}: ComponentBase & {
	percentPassed: string
	title: string
	continuous?: boolean
}) => (
	<Stat>
		{title}
		<div
			className={classes.loader}
			style={{ ...style, marginRight: '1.25rem' }}
		/>
		<span className="counter">{percentPassed}%</span>
	</Stat>
)
