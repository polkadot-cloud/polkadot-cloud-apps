// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { JSX } from 'react'
import commonClasses from '../common.module.scss'
import type { ButtonOptionProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

/**
 * @name ButtonOption
 * @description A customizable option button component for handling various user actions. This
 * component can display content alongside optional child elements and provides built-in event
 * handling for mouse interactions.
 *
 * @returns {JSX.Element} The rendered ButtonOption component, displaying any provided children and
 * a right-facing chevron icon.
 */
export const ButtonOption = (props: ButtonOptionProps): JSX.Element => {
	const {
		children,
		className,
		style,
		disabled,
		onClick,
		onMouseOver,
		onMouseMove,
		onMouseOut,
	} = props

	const buttonClasses = classNames(
		commonClasses.btnCore,
		classes.btnOption,
		{
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
			<div className={classes.btnContentDetails}>{children}</div>
			<div>
				<FontAwesomeIcon
					transform="shrink-2"
					icon={faChevronRight}
					className={classes.btnContentIcon}
				/>
			</div>
		</button>
	)
}
