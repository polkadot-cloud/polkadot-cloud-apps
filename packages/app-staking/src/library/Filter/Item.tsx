// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'motion/react'
import type { ItemProps } from './types'
import { ItemWrapper } from './Wrappers'

export const Item = ({
	disabled = false,
	icon,
	label,
	transform,
	onClick,
}: ItemProps) => (
	<motion.button
		whileHover={{ scale: 1.02 }}
		whileTap={{ scale: 0.99 }}
		transition={{
			duration: 0.3,
		}}
		onClick={() => {
			if (onClick !== undefined) {
				onClick()
			}
		}}
		disabled={disabled}
	>
		<ItemWrapper>
			{icon ? (
				<div className="icon">
					<FontAwesomeIcon icon={icon} transform={transform} />
				</div>
			) : null}
			<p>{label}</p>
		</ItemWrapper>
	</motion.button>
)
