// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ValidatorEntry,
	ValidatorSupportedNetwork,
} from '@w3ux/validator-assets'
import { useOperators } from 'hooks/useOperators'
import { useEffect, useState } from 'react'
import { Page } from 'ui-core/base'
import { useOperatorsSections } from './context'
import { Item } from './Item'
import { ItemsWrapper } from './Wrappers'

export const List = ({ network }: { network: ValidatorSupportedNetwork }) => {
	const { scrollPos } = useOperatorsSections()
	const { getNetworkOperators } = useOperators()

	const [entityItems, setEntityItems] = useState<ValidatorEntry[]>(
		getNetworkOperators(network),
	)

	useEffect(() => {
		setEntityItems(getNetworkOperators(network))
	}, [network])

	useEffect(() => {
		window.scrollTo(0, scrollPos)
	}, [scrollPos])

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				duration: scrollPos ? 0 : 0.5,
				staggerChildren: scrollPos ? 0 : 0.025,
			},
		},
	}

	return (
		<Page.Row yMargin>
			<ItemsWrapper variants={container} initial="hidden" animate="show">
				{entityItems.map((item) => (
					<Item
						key={`operator_item_${item.name}`}
						network={network}
						item={item}
						actionable
					/>
				))}
			</ItemsWrapper>
		</Page.Row>
	)
}
