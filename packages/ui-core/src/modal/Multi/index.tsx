// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { motion } from 'motion/react'
import type { ComponentBase } from 'types'
import commonClasses from '../../common.module.scss'
import classes from './index.module.scss'

export const Multi = ({ children, style }: ComponentBase) => {
	const allClasses = classNames(commonClasses.scroll, classes.multi)
	return (
		<motion.div className={allClasses} style={style}>
			{children}
		</motion.div>
	)
}
