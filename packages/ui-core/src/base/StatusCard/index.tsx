// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
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
	action?: ReactNode
	icon?: IconDefinition
	iconFrame?: boolean
	status: StatusCardStatus
	title?: ReactNode
}

export const StatusCard = ({
	action,
	children,
	className,
	icon,
	iconFrame = true,
	status,
	title,
	...props
}: StatusCardProps) => (
	<div
		{...props}
		className={classNames(classes.statusCard, classes[status], className)}
	>
		<div className={classes.icon}>
			<span
				aria-hidden
				className={classNames(classes.statusIcon, {
					[classes.unframedIcon]: !iconFrame,
				})}
			>
				<FontAwesomeIcon icon={icon ?? STATUS_ICONS[status]} />
			</span>
		</div>
		<div className={classes.copy}>
			{title && <strong>{title}</strong>}
			<span>{children}</span>
		</div>
		{action && <div className={classes.action}>{action}</div>}
	</div>
)
