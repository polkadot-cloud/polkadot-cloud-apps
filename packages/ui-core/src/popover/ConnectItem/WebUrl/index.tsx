// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const WebUrl = ({
	url,
	text,
	style,
}: ComponentBase & {
	url: string
	text: string
}) => (
	<h4 className={classes.webUrl} style={style}>
		<button
			type="button"
			onClick={(ev) => {
				ev.stopPropagation()
				window.open(url, '_blank', 'noopener,noreferrer')
			}}
		>
			{text}
		</button>
	</h4>
)
