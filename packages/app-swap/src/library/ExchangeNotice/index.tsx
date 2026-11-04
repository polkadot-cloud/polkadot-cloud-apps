// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleExclamation,
	faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import classes from './index.module.scss'

export const ExchangeNotice = ({
	children,
	status = 'warning',
	action,
	padded = false,
}: {
	children: ReactNode
	status?: 'warning' | 'danger'
	action?: ReactNode
	padded?: boolean
}) => (
	<div
		role={status === 'danger' ? 'alert' : 'status'}
		className={classes.notice}
		data-padded={padded || undefined}
	>
		<FontAwesomeIcon
			icon={status === 'danger' ? faCircleExclamation : faTriangleExclamation}
			aria-hidden
		/>
		<span>{children}</span>
		{action}
	</div>
)
