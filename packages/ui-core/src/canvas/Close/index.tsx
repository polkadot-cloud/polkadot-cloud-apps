// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Close = ({
	onClose,
	style,
}: ComponentBase & { onClose: () => void }) => {
	const allClasses = classNames(classes.close)

	return (
		<div className={allClasses}>
			<button type="button" onClick={() => onClose()} style={style}>
				<FontAwesomeIcon icon={faXmark} />
			</button>
		</div>
	)
}
