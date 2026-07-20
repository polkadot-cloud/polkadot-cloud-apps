// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { motion } from 'motion/react'
import { Item } from './Item'
import type { NominatorListProps } from './types'

export const NominatorList = ({ items, unit }: NominatorListProps) => (
	<ListWrapper>
		<List $flexBasisLarge={'33.33%'}>
			<MotionContainer>
				{items.map((item) => (
					<motion.div
						key={`nominator_${item.address || item.label}`}
						className="item col"
						variants={{
							hidden: {
								y: 15,
								opacity: 0,
							},
							show: {
								y: 0,
								opacity: 1,
							},
						}}
					>
						<Item item={item} unit={unit} />
					</motion.div>
				))}
			</MotionContainer>
		</List>
	</ListWrapper>
)
