// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { JSX } from 'react'
import commonClasses from '../common.module.scss'
import type { ButtonTabProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

/**
 * @name ButtonTab
 * @description A tab-style button component used to represent selectable tabs within an interface.
 * This component supports active states, badges for additional information, and customizable styles
 * and event handling, making it suitable for interactive tab navigation or selection.
 *
 * @returns {JSX.Element} The rendered ButtonTab component, styled according to the provided props
 * and supporting additional customization for icons, colors, and margins.
 */
export const ButtonTab = (props: ButtonTabProps): JSX.Element => {
	const {
		disabled,
		className,
		style,
		active,
		title,
		badge,
		onClick,
		colorSecondary,
		onMouseOver,
		onMouseMove,
		onMouseOut,
	} = props

	const activeClass = colorSecondary
		? classes.btnTabSecondaryColorActive
		: classes.btnTabActive

	const buttonClasses = classNames(
		commonClasses.btnCore,
		classes.btnTab,
		{
			[commonClasses.btnDisabled]: disabled,
			[activeClass]: active,
			[classes.btnTabSecondaryColor]: colorSecondary,
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
			<span className={classes.btnTabInner}>
				{title}
				{badge && <span className={classes.btnTabBadge}>{badge}</span>}
			</span>
		</button>
	)
}
