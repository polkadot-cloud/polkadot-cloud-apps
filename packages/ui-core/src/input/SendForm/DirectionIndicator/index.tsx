// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowDown,
	faArrowRightArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classes from './index.module.scss'

export const DirectionIndicator = ({
	onReverse,
	label,
}: {
	onReverse?: () => void
	label?: string
} = {}) => (
	<div className={classes.directionIndicator}>
		{onReverse ? (
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
		)}
	</div>
)
