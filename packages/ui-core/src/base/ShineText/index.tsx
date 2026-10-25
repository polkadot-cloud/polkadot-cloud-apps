// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentPropsWithoutRef } from 'react'
import classes from './index.module.scss'

type ShineTextProps = ComponentPropsWithoutRef<'span'> & {
	active?: boolean
}

export const ShineText = ({
	active = true,
	children,
	className,
	...props
}: ShineTextProps) => (
	<span
		{...props}
		className={classNames(
			classes.text,
			{ [classes.active]: active },
			className,
		)}
	>
		{children}
	</span>
)
