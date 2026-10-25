// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowDown,
	faArrowRightArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import { Tooltip } from '../../../base/Tooltip'
import classes from './index.module.scss'

export const DirectionIndicator = ({
	onReverse,
	label,
	children,
	tooltip,
	tooltipContainer,
}: {
	onReverse?: () => void
	label?: string
	children?: ReactNode
	tooltip?: string
	tooltipContainer?: HTMLDivElement
} = {}) => {
	const button = onReverse ? (
		<button
			type="button"
			className={`${classes.directionButton} ${classes.interactiveButton}`}
			aria-label={label}
			onClick={onReverse}
		>
			<FontAwesomeIcon
				icon={faArrowRightArrowLeft}
				rotation={90}
				className={classes.directionIcon}
			/>
		</button>
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
