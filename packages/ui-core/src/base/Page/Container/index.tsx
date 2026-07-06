// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Container
 * @summary Page container.
 */
export const Container = ({ children, style }: ComponentBase) => {
	const allClasses = classNames(classes.container, 'containerWidth')
	return (
		<div className={allClasses} style={{ ...style }}>
			{children}
		</div>
	)
}
