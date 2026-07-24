// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import type { ButtonSubmitLargeProps } from '../types'
import classes from './index.module.scss'

/**
 * @name ButtonSubmitLarge
 * @description A large, call-to-action submit button with optional icon and pulse state.
 */
export const ButtonSubmitLarge = ({
	disabled,
	onSubmit,
	submitText,
	icon,
	iconTransform,
	pulse,
	className,
	style,
}: ButtonSubmitLargeProps): JSX.Element => {
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
				{icon && (
					<FontAwesomeIcon icon={icon} transform={iconTransform || undefined} />
				)}
				{submitText}
			</button>
		</div>
	)
}
