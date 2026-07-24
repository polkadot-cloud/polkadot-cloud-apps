// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import commonClasses from '../common.module.scss'
import type { ButtonMonoProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

/**
 * @name ButtonMono
 * @description Monotone button style used within the main interface of dashboards.
 * @param {ButtonMonoProps} props - The properties used to configure the ButtonMono component.
 *
 * @returns {JSX.Element} The rendered ButtonMono component.
 */
export const ButtonMono = (props: ButtonMonoProps): JSX.Element => {
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
	} = props

	const buttonClasses = classNames(
		commonClasses.btnCore,
		classes.btnMono,
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
