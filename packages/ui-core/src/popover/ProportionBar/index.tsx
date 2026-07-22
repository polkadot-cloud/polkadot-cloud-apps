// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classes from './index.module.scss'

export const ProportionBar = ({ percentage }: { percentage: number }) => {
	const normalizedPercentage = Math.min(Math.max(percentage, 0), 100)

	return (
		<div className={classes.proportionBar}>
			<h4>{normalizedPercentage}%</h4>
			<div className={classes.track} aria-hidden="true">
				<div
					className={classes.fill}
					style={{ width: `${normalizedPercentage}%` }}
				/>
			</div>
		</div>
	)
}
