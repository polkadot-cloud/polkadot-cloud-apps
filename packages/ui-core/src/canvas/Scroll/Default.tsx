// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { motion } from 'motion/react'
import { forwardRef } from 'react'
import SimpleBar from 'simplebar-react'
import type { ScrollProps } from '../types'
import classes from './index.module.scss'

export const DefaultScroll = forwardRef<HTMLDivElement, ScrollProps>(
	({ children, ...rest }, ref) => (
		<motion.div
			className={classNames(classes.scroll, classes.default)}
			{...rest}
		>
			<SimpleBar
				autoHide={true}
				style={{ height: '100%' }}
				scrollableNodeProps={{ ref }}
			>
				{children}
			</SimpleBar>
		</motion.div>
	),
)

DefaultScroll.displayName = 'DefaultScroll'
