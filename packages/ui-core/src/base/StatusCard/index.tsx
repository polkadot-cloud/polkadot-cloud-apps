// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCheck,
	faExclamation,
	faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import classes from './index.module.scss'

const STATUS_ICONS = {
	danger: faXmark,
	success: faCheck,
	warning: faExclamation,
} as const

type StatusCardStatus = keyof typeof STATUS_ICONS

type StatusCardProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
	status: StatusCardStatus
	title?: ReactNode
}

export const StatusCard = ({
	children,
	className,
	status,
	title,
	...props
}: StatusCardProps) => (
	<div
		{...props}
		className={classNames(classes.statusCard, classes[status], className)}
	>
		<div className={classes.icon}>
			<span aria-hidden className={classes.statusIcon}>
				<FontAwesomeIcon icon={STATUS_ICONS[status]} />
			</span>
		</div>
		<div className={classes.copy}>
			{title && <strong>{title}</strong>}
			<span>{children}</span>
		</div>
	</div>
)
