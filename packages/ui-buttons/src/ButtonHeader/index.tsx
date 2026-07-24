// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { ButtonHeaderProps } from '../types'
import classes from './index.module.scss'

export const ButtonHeader = ({
	style,
	icon,
	iconTransform,
	className,
	active,
	acknowledged,
}: ButtonHeaderProps) => {
	const allClasses = classNames(classes.btnHeader)
	const activeClasses = classNames(classes.active, {
		[classes.pulse]: !acknowledged,
	})

	return (
		<div
			className={`${className ? `${className} ` : ``}${allClasses}`}
			style={style}
		>
			<FontAwesomeIcon icon={icon} transform={iconTransform} />
			{active && <span className={activeClasses} />}
		</div>
	)
}
