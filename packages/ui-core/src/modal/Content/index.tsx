// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { motion } from 'motion/react'
import type { ContentProps } from '../types'
import classes from './index.module.scss'

export const Content = ({ children, canvas, style }: ContentProps) => {
	const allClasses = classNames(classes.content, {
		[classes.canvas]: canvas,
	})
	return (
		<motion.div className={allClasses} style={style}>
			{children}
		</motion.div>
	)
}
