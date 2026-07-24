// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import commonClasses from '../common.module.scss'
import type { ButtonPrimaryInvertProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

/**
 * @name ButtonPrimaryInvert
 * @description Primary button style used within the main interface of the dashboard. This button
 * component supports icons, conditional styling, and dynamic sizing and margin options.
 *
 * @param {ButtonPrimaryInvertProps} props - The props for the ButtonPrimary component.
 * @returns {JSX.Element} The rendered primary button component.
 */
export const ButtonPrimaryInvert = (
	props: ButtonPrimaryInvertProps,
): JSX.Element => {
	const {
		disabled,
		grow,
		iconLeft,
		iconRight,
		iconTransform,
		lg,
		marginLeft,
		marginRight,
		marginX,
		className,
		style,
		text,
		onClick,
		onMouseOver,
		onMouseMove,
		onMouseOut,
		asLabel,
	} = props

	const buttonClasses = classNames(
		commonClasses.btnCore,
		classes.btnPrimaryInvert,
		{
			[commonClasses.btnLarge]: lg,
			[commonClasses.btnSmall]: !lg,
			[commonClasses.btnGrow]: grow,
			[commonClasses.btnSpacingLeft]: marginLeft,
			[commonClasses.btnSpacingRight]: marginRight,
			[commonClasses.btnMarginX]: marginX,
			[commonClasses.btnDisabled]: disabled,
			[commonClasses.btnActiveTransforms]: !disabled,
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
