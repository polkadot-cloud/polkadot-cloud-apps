// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { SectionProps } from '../types'
import classes from './index.module.scss'

export const Section = ({ children, style, type }: SectionProps) => {
	const allClasses = classNames({
		[classes.carousel]: type === 'carousel',
		[classes.tab]: type === 'tab',
	})
	return (
		<div className={allClasses} style={style}>
			{children}
		</div>
	)
}
