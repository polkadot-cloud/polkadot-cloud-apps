// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { CheckboxProps } from '../types'
import classes from './index.module.scss'

export const Checkbox = ({ style, onClick, checked }: CheckboxProps) => {
	const allClasses = classNames(classes.checkbox, {
		[classes.checked]: checked,
	})

	return (
		<button
			type="button"
			className={allClasses}
			style={style}
			onClick={() => onClick()}
		>
			{checked && <FontAwesomeIcon icon={faCheck} transform="shrink-2" />}
		</button>
	)
}
