// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider } from 'contexts/List'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { CardWrapper } from 'library/Card/Wrappers'
import { PoolList } from 'library/PoolList'
import { Page } from 'ui-core/base'

export const PoolsOverview = () => {
	const { bondedPools } = useBondedPools()

	return (
		<Page.Row>
			<CardWrapper>
				<ListProvider>
					<PoolList
						pools={bondedPools}
						itemsPerPage={50}
						allowMoreCols
						allowSearch
					/>
				</ListProvider>
			</CardWrapper>
		</Page.Row>
	)
}
