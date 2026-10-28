// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowDown,
	faArrowRightArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import { Tooltip } from '../../../base/Tooltip'
import classes from './index.module.scss'
import type {
	SendFormDirectionButtonProps,
	SendFormDirectionIndicatorProps,
} from './types'

export const DirectionButton = ({
	icon,
	rotation,
	children,
	className,
	...props
}: SendFormDirectionButtonProps) => (
	<button
		type="button"
		className={classNames(
			classes.directionButton,
			classes.interactiveButton,
			{ [classes.labeledButton]: !!children },
			className,
		)}
		{...props}
	>
		<FontAwesomeIcon
			icon={icon}
			rotation={rotation}
			className={classes.directionIcon}
		/>
		{children && <span>{children}</span>}
	</button>
)

export const DirectionIndicator = ({
	onReverse,
	label,
	children,
	tooltip,
	tooltipContainer,
}: SendFormDirectionIndicatorProps = {}) => {
	const button = onReverse ? (
		<DirectionButton
			icon={faArrowRightArrowLeft}
			rotation={90}
			aria-label={label}
			onClick={onReverse}
		/>
	) : (
		<div className={classes.directionButton}>
			<FontAwesomeIcon icon={faArrowDown} className={classes.directionIcon} />
		</div>
	)
	return (
		<div className={classes.directionIndicator}>
			{onReverse && tooltip ? (
				<Tooltip text={tooltip} container={tooltipContainer} side="top">
					{button}
				</Tooltip>
			) : (
				button
			)}
			{children}
		</div>
	)
}
