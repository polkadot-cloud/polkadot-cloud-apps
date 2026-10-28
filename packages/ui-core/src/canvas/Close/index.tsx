// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ComponentBase } from 'types'
import { CanvasHeaderControl } from '../HeaderControl'
import type { CanvasVariant } from '../types'
import classes from './index.module.scss'

export const Close = ({
	onClose,
	style,
	variant = 'default',
}: ComponentBase & {
	onClose: () => void
	variant?: CanvasVariant
}) => {
	const button = (
		<button type="button" onClick={() => onClose()} style={style}>
			<FontAwesomeIcon icon={faXmark} />
		</button>
	)

	if (variant === 'card') {
		return <CanvasHeaderControl>{button}</CanvasHeaderControl>
	}

	return <div className={classes.close}>{button}</div>
}
