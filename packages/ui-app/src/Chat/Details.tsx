// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classes from './index.module.scss'
import type { ChatDetailsProps } from './types'

export const ChatDetails = ({ label, children }: ChatDetailsProps) => (
	<section className={classes.details} aria-label={label}>
		<h4>{label}</h4>
		{children}
	</section>
)
