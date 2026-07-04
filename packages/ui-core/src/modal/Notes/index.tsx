// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { NotesProps } from '../types'
import classes from './index.module.scss'

export const Notes = ({ children, style, withPadding }: NotesProps) => {
	const allClasses = classNames(classes.notes, {
		[classes.withPadding]: withPadding,
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
