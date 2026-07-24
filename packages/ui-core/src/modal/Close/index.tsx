// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classes from './index.module.scss'

export const Close = ({ onClose }: { onClose: () => void }) => (
	<div className={classes.close}>
		<button type="button" onClick={() => onClose()}>
			<FontAwesomeIcon icon={faXmark} />
		</button>
	</div>
)
