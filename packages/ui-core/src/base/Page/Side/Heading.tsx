// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import classes from './index.module.scss'
import type { HeadingProps } from './types'

export const Heading = ({ title, minimised }: HeadingProps) => {
	const allClasses = classNames(classes.heading, {
		[classes.minimised]: !!minimised,
	})
	return (
		<div className={allClasses}>
			{minimised ? <h5>&bull;</h5> : <h5>{title}</h5>}
		</div>
	)
}
