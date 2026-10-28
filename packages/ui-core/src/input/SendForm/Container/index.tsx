// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBaseWithClassName } from 'types'
import classes from './index.module.scss'

export const Container = ({
	children,
	className,
	style,
}: ComponentBaseWithClassName) => (
	<div className={classNames(classes.container, className)} style={style}>
		{children}
	</div>
)
