// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import classes from './index.module.scss'

export const Item = ({
	children,
	last,
	asButton,
	onClick,
}: {
	children: React.ReactNode
	last?: boolean
	asButton?: boolean
	onClick?: () => void
}) => {
	const allClasses = classNames(classes.item, {
		[classes.asButton]: !!asButton,
		[classes.last]: !!last,
	})
	return (
		<div className={allClasses} onClick={onClick}>
			{children}
		</div>
	)
}
