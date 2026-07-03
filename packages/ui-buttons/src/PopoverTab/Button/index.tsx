// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ButtonPopoverTabProps } from '../../types'
import { onMouseHandlers } from '../../util'
import classes from './index.module.scss'

export const Button = ({
	text,
	status,
	grow = true,
	className,
	style,
	onClick,
	onMouseOver,
	onMouseMove,
	onMouseOut,
	disabled,
}: ButtonPopoverTabProps) => {
	const allClasses = classNames(
		classes.btnPopoverTab,
		{
			[classes.warning]: status === 'warning',
			[classes.danger]: status === 'danger',
			[classes.grow]: !!grow,
			[classes.disabled]: disabled,
		},
		className,
	)

	return (
		<button
			type="button"
			className={allClasses}
			style={style}
			disabled={disabled}
			{...onMouseHandlers({ onClick, onMouseOver, onMouseMove, onMouseOut })}
		>
			{text}
		</button>
	)
}
