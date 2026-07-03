// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'motion/react'
import type { MotionContainerProps } from './types'

export const MotionContainer = ({
	thisSection,
	activeSection,
	children,
}: MotionContainerProps) => {
	// container variants
	const containerVariants = {
		hidden: {
			height: '0px',
		},
		visible: {
			height: 'auto',
		},
	}

	// animate container default
	const animate = thisSection === activeSection ? 'visible' : 'hidden'

	return (
		<motion.div
			initial={false}
			style={{ overflow: 'hidden', width: '100%' }}
			variants={containerVariants}
			animate={animate}
			transition={{
				duration: 0.5,
				type: 'spring' as const,
				bounce: 0.2,
			}}
		>
			{children}
		</motion.div>
	)
}
