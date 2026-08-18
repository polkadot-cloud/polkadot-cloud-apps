// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { motion } from 'motion/react'
import { forwardRef } from 'react'
import type { ScrollProps } from '../types'
import classes from './index.module.scss'

export const CardScroll = forwardRef<HTMLDivElement, ScrollProps>(
	({ children, ...rest }, ref) => (
		<motion.div
			ref={ref}
			className={classNames(classes.scroll, classes.card)}
			{...rest}
		>
			{children}
		</motion.div>
	),
)

CardScroll.displayName = 'CardScroll'
