// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classes from './index.module.scss'

export const Interface = ({
	Main,
	Side,
}: {
	Main: React.ReactNode
	Side?: React.ReactNode
}) => (
	<div className={classes.interface}>
		{Main && <div className={classes.main}>{Main}</div>}
		{Side && <div className={classes.side}>{Side}</div>}
	</div>
)
