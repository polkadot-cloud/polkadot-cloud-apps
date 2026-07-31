// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classes from './index.module.scss'

export const DirectionIndicator = () => (
	<div className={classes.directionIndicator}>
		<div className={classes.directionButton}>
			<FontAwesomeIcon icon={faArrowDown} className={classes.directionIcon} />
		</div>
	</div>
)
