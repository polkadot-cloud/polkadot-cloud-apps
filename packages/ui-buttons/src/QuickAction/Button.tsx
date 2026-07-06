// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ButtonQuickActionProps } from '../types'
import classes from './index.module.scss'

export const Button = ({
	onClick,
	label,
	disabled,
	Icon,
}: ButtonQuickActionProps) => {
	const buttonClasses = classNames(classes.inner, {
		[classes.disabled]: disabled,
		[classes.active]: !disabled,
	})

	return (
		<div className={classes.button}>
			<button
				type="button"
				className={buttonClasses}
				onClick={onClick}
				disabled={disabled}
			>
				<span className={classes.icon}>
					<Icon />
				</span>
				<h4>{label}</h4>
			</button>
		</div>
	)
}
