// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { TooltipAreaProps } from '../types'
import classes from './index.module.scss'

export const TooltipArea = ({
	style,
	text,
	pointer,
	onClick,
	onMouseMove,
}: TooltipAreaProps) => {
	const allClasses = classNames(
		'tooltip-trigger-element',
		classes.tooltipArea,
		{
			[classes.pointer]: !!pointer,
		},
	)
	return (
		<div
			className={allClasses}
			data-tooltip-text={text}
			style={style}
			onMouseMove={() => onMouseMove()}
			onClick={() => onClick?.()}
		/>
	)
}
