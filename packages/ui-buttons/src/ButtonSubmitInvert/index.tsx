// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import commonClasses from '../common.module.scss'
import type { ButtonSubmitInvertProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

/**
 * @name ButtonSubmitInvert
 * @description A customizable submit button component used for form submissions or primary actions
 * within the interface.
 *
 * @returns {JSX.Element} The rendered ButtonSubmitInvert component, styled according to the
 * provided props and supporting additional customization for icons, colors, and margins.
 */
export const ButtonSubmitInvert = (
	props: ButtonSubmitInvertProps,
): JSX.Element => {
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
		onClick,
		onMouseOver,
		onMouseMove,
		onMouseOut,
	} = props

	const buttonClasses = classNames(
		commonClasses.btnCore,
		classes.btnSubmitInvert,
		{
			[commonClasses.btnGrow]: grow,
			[commonClasses.btnSpacingLeft]: marginLeft,
			[commonClasses.btnSpacingRight]: marginRight,
			[commonClasses.btnMarginX]: marginX,
			[commonClasses.btnDisabled]: disabled,
			[commonClasses.btnActiveTransforms]: !disabled,
			[classes.btnSubmitInvertLg]: lg,
			[classes.btnSubmitInvertSm]: !lg,
		},
		className,
	)

	return (
		<button
			className={buttonClasses}
			style={style}
			type="button"
			disabled={disabled}
			{...onMouseHandlers({ onClick, onMouseOver, onMouseMove, onMouseOut })}
		>
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
		</button>
	)
}
