// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import type { ComponentBase } from 'types'
import commonClasses from '../../common.module.scss'
import type { CanvasVariant } from '../types'
import classes from './index.module.scss'

export const Container = ({
	children,
	variant = 'default',
	...rest
}: ComponentBase &
	HTMLMotionProps<'div'> & {
		variant?: CanvasVariant
	}) => {
	const allClasses = classNames(commonClasses.fixed, classes.container, {
		[classes.card]: variant === 'card',
	})
	return (
		<motion.div className={allClasses} {...rest}>
			{children}
		</motion.div>
	)
}
