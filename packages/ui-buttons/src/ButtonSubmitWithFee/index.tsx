// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import type { ButtonSubmitWithFeeProps } from '../types'
import classes from './index.module.scss'

/**
 * @name ButtonSubmitWithFee
 * @description A unified submit button with transaction fee display in two rows.
 * Row 1: Icon and submit text
 * Row 2: Transaction fee
 */
export const ButtonSubmitWithFee = ({
	disabled,
	onSubmit,
	submitText,
	icon,
	iconTransform,
	pulse,
	fee,
	className,
	style,
}: ButtonSubmitWithFeeProps): JSX.Element => {
	const wrapperClasses = classNames(classes.wrapper, className)
	const buttonClasses = classNames(classes.button, {
		[classes.buttonDisabled]: disabled,
		[classes.buttonPulse]: pulse,
	})

	return (
		<div className={wrapperClasses} style={style}>
			<button
				type="button"
				className={buttonClasses}
				onClick={() => onSubmit()}
				disabled={disabled}
			>
				<span className={classes.buttonContent}>
					<span className={classes.rowOne}>
						{submitText}
						{icon && (
							<FontAwesomeIcon
								icon={icon}
								transform={iconTransform || undefined}
							/>
						)}
					</span>
					{fee && <span className={classes.rowTwo}>{fee}</span>}
				</span>
			</button>
		</div>
	)
}
