// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import commonClasses from '../common.module.scss'
import type { ButtonSubmitProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

/**
 * @name ButtonSubmit
 * @description A customizable submit button component used for form submissions or primary actions
 * within the interface.
 *
 * @returns {JSX.Element} The rendered ButtonSubmit component, styled according to the provided
 * props and supporting additional customization for icons, colors, and margins.
 */
export const ButtonSubmit = (props: ButtonSubmitProps): JSX.Element => {
	const {
		disabled,
		grow,
		iconLeft,
		iconRight,
		iconTransform,
		marginLeft,
		marginRight,
		marginX,
		className,
		style,
		text,
		lg,
		pulse,
		onClick,
		onMouseOver,
		onMouseMove,
		onMouseOut,
		asLabel,
	} = props

	const buttonClasses = classNames(
		commonClasses.btnCore,
		classes.btnSubmit,
		{
			[commonClasses.btnGrow]: grow,
			[commonClasses.btnSpacingLeft]: marginLeft,
			[commonClasses.btnSpacingRight]: marginRight,
			[commonClasses.btnMarginX]: marginX,
			[commonClasses.btnDisabled]: disabled,
			[commonClasses.btnActiveTransforms]: !disabled,
			[classes.btnSubmitLg]: lg,
			[classes.btnSubmitSm]: !lg,
			[classes.btnSubmitPulse]: pulse,
		},
		className,
	)
	const buttonContent = (
		<>
			{iconLeft && (
				<FontAwesomeIcon
					icon={iconLeft}
					className={text && commonClasses.btnIconLeftSpacing}
					transform={iconTransform}
				/>
			)}
			{text}
			{iconRight && (
				<FontAwesomeIcon
					icon={iconRight}
					className={text && commonClasses.btnIconRightSpacing}
					transform={iconTransform}
				/>
			)}
		</>
	)

	if (asLabel) {
		return (
			<div className={buttonClasses} style={style}>
				{buttonContent}
			</div>
		)
	}

	return (
		<button
			className={buttonClasses}
			style={style}
			type="button"
			disabled={disabled}
			{...onMouseHandlers({ onClick, onMouseOver, onMouseMove, onMouseOut })}
		>
			{buttonContent}
		</button>
	)
}
