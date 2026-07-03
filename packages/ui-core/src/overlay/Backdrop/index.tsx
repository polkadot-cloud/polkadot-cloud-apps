// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { motion } from 'motion/react'
import commonClasses from '../../common.module.scss'
import type { BackdropProps } from '../types'
import classes from './index.module.scss'

export const Backdrop = ({ children, blur, ...rest }: BackdropProps) => {
	const allClasses = classNames(commonClasses.fixed, classes.backdrop)
	return (
		<motion.div
			style={blur ? { backdropFilter: `blur(${blur})` } : undefined}
			className={allClasses}
			{...rest}
		>
			{children}
		</motion.div>
	)
}
