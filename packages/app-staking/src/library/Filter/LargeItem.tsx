// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'motion/react'
import type { LargerFilterItemProps } from './types'
import { LargeItemWrapper } from './Wrappers'

export const LargeItem = ({
	disabled = false,
	active,
	icon,
	title,
	subtitle,
	transform,
	onClick,
}: LargerFilterItemProps) => (
	<motion.button
		disabled={disabled}
		whileHover={{ scale: 1.01 }}
		whileTap={{ scale: 0.99 }}
		transition={{
			duration: 0.3,
		}}
		onClick={() => onClick()}
		className="item"
		style={{
			opacity: disabled ? 0.5 : 1,
		}}
	>
		<LargeItemWrapper>
			<div className="inner">
				<section>
					<FontAwesomeIcon
						icon={icon}
						transform={transform}
						opacity={active ? 1 : 0.7}
					/>

					<h3>{title}</h3>
				</section>
				<section>
					<p>{subtitle}</p>
				</section>
			</div>
		</LargeItemWrapper>
	</motion.button>
)
