// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { Item } from './Item'
import type { NominatorListProps } from './types'

export const NominatorList = ({ items, unit }: NominatorListProps) => (
	<ListWrapper>
		<List $flexBasisLarge={'33.33%'}>
			<MotionContainer>
				{items.map((item) => (
					<MotionItem
						key={`nominator_${item.address || item.label}`}
						className="item col"
					>
						<Item item={item} unit={unit} />
					</MotionItem>
				))}
			</MotionContainer>
		</List>
	</ListWrapper>
)
