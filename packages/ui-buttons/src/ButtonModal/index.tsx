// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { ButtonModalProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

export const ButtonModal = ({
	text,
	label,
	selected,
	className,
	disabled,
	style,
	onClick,
	onMouseMove,
	onMouseOut,
	onMouseOver,
}: ButtonModalProps) => {
	const allClasses = classNames(classes.btnModal, className, {
		[classes.btnModalSelected]: selected,
		[classes.btnModalDisabled]: disabled,
	})

	return (
		<button
			type="button"
			className={allClasses}
			style={style}
			disabled={disabled}
			{...onMouseHandlers({ onClick, onMouseOver, onMouseMove, onMouseOut })}
		>
			<h3>{text}</h3>
			{label === 'toggle' ? (
				<h5 className={classes.toggle}>
					<FontAwesomeIcon
						className={selected ? classes.on : classes.off}
						icon={selected ? faToggleOn : faToggleOff}
						transform="grow-10"
					/>
				</h5>
			) : label === undefined ? null : (
				<h5>{label}</h5>
			)}
		</button>
	)
}
