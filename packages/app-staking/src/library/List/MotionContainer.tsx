// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

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
