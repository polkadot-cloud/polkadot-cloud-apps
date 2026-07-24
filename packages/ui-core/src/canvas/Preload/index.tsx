// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Loader } from '../Loader'
import classes from './index.module.scss'

export const Preload = ({
	percentPassed,
	title,
}: {
	percentPassed?: string
	title: string
}) => (
	<div className={classes.preload}>
		<h2>{title}</h2>
		{!percentPassed ? (
			<Loader />
		) : (
			<div className={classes.loader}>
				<div>
					<div
						className={classes.progress}
						style={{ width: `${percentPassed}%` }}
					></div>
				</div>
			</div>
		)}
	</div>
)
