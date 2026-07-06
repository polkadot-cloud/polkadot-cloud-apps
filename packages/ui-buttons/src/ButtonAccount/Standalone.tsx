// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { ButtonAccountStandaloneProps } from '../types'
import { onMouseHandlers } from '../util'
import classes from './index.module.scss'

export const Standalone = ({
	label,
	className,
	marginLeft,
	style,
	onClick,
	onMouseOver,
	onMouseMove,
	onMouseOut,
	disabled,
}: ButtonAccountStandaloneProps) => {
	const allClasses = classNames(classes.btnAccount, {
		[classes.marginLeft]: marginLeft,
	})

	return (
		<button
			type="button"
			className={`${className ? `${className} ` : ' '}${allClasses}`}
			style={style}
			disabled={disabled}
			{...onMouseHandlers({ onClick, onMouseOver, onMouseMove, onMouseOut })}
		>
			<span className={classes.display}>{label}</span>
			<div className={classes.arrow}>
				<FontAwesomeIcon icon={faChevronRight} transform="shrink-5" />
			</div>
		</button>
	)
}
