// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleInfo,
	faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classes from './index.module.scss'
import type { ChatNoticeProps } from './types'

export const ChatNotice = ({ children, tone = 'neutral' }: ChatNoticeProps) => (
	<div className={classes.notice} data-tone={tone} role="status">
		<FontAwesomeIcon
			icon={
				tone === 'danger' || tone === 'warning'
					? faTriangleExclamation
					: faCircleInfo
			}
		/>
		<span>{children}</span>
	</div>
)
