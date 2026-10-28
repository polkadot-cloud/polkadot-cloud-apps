// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const itemVariants = {
	hidden: { opacity: 0, y: 15 },
	show: { opacity: 1, y: 0 },
}

export const MotionContainer = ({
	children,
	staggerChildren = 0.015,
}: {
	staggerChildren?: number
	children: ReactNode
}) => (
	<motion.div
		initial="hidden"
		animate="show"
		variants={{
			hidden: { opacity: 0 },
			show: {
				opacity: 1,
				transition: {
					staggerChildren,
				},
			},
		}}
	>
		{children}
	</motion.div>
)

export const MotionItem = ({
	children,
	className,
}: {
	children: ReactNode
	className: string
}) => (
	<motion.div className={className} variants={itemVariants}>
		{children}
	</motion.div>
)
