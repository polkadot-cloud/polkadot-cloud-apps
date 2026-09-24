// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faComments } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import classes from './index.module.scss'

export const ChatWelcome = ({ children }: { children: ReactNode }) => (
	<div className={classes.welcome}>
		<div className={classes.welcomeIcon} aria-hidden="true">
			<FontAwesomeIcon icon={faComments} />
		</div>
		{children}
	</div>
)
