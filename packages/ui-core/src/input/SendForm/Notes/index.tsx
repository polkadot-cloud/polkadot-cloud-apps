// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ReactNode } from 'react'
import classes from './index.module.scss'

export type SendFormNotesProps = {
	children: ReactNode
}

export type SendFormNoteProps = {
	label: string
	children: ReactNode
	variant?: 'default' | 'success'
}

export const Notes = ({ children }: SendFormNotesProps) => (
	<div className={classes.notes}>{children}</div>
)

export const Note = ({
	label,
	children,
	variant = 'default',
}: SendFormNoteProps) => (
	<div className={classes.note}>
		<span className={classes.label}>{label}</span>
		<span
			className={classNames(classes.value, {
				[classes.defaultValue]: variant === 'default',
				[classes.successValue]: variant === 'success',
			})}
		>
			{children}
		</span>
	</div>
)
