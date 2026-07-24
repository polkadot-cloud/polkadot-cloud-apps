// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import commonClasses from '../common.module.scss'
import type { MultiButtonButtonProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

export const Button = (props: MultiButtonButtonProps): JSX.Element => {
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
		onClick,
		onMouseOver,
		onMouseMove,
		onMouseOut,
		size,
	} = props

	const buttonClasses = classNames(
		commonClasses.btnCore,
		classes.btnText,
		{
			[classes.sm]: size !== 'md',
			[commonClasses.btnMedium]: size === 'md',
			[commonClasses.btnGrow]: grow,
			[commonClasses.btnSpacingLeft]: marginLeft,
			[commonClasses.btnSpacingRight]: marginRight,
			[commonClasses.btnMarginX]: marginX,
			[commonClasses.btnDisabled]: disabled,
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
