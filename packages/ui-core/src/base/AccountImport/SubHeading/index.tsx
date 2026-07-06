// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const SubHeading = ({
	text,
	style,
}: ComponentBase & {
	text: string
}) => (
	<h4 className={classes.subHeading} style={style}>
		{text}
	</h4>
)
