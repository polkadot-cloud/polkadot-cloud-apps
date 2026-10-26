// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { HTMLAttributes, ReactNode } from 'react'
import classes from './index.module.scss'

export type SendFormNotesProps = {
	children: ReactNode
	className?: string
}

export type SendFormNoteProps = HTMLAttributes<HTMLDivElement> & {
	label: ReactNode
	children: ReactNode
	variant?: 'default' | 'success' | 'muted'
}

export const Notes = ({ children, className }: SendFormNotesProps) => (
	<div className={classNames(classes.notes, className)}>{children}</div>
)

export const Note = ({
	label,
	children,
	variant = 'default',
	className,
	...props
}: SendFormNoteProps) => (
	<div className={classNames(classes.note, className)} {...props}>
		<span className={classes.label}>{label}</span>
		<div
			className={classNames(classes.value, {
				[classes.defaultValue]: variant === 'default',
				[classes.successValue]: variant === 'success',
				[classes.mutedValue]: variant === 'muted',
			})}
		>
			{children}
		</div>
	</div>
)
