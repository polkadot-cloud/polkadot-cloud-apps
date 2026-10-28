// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider } from 'contexts/List'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { PoolList } from 'library/PoolList'
import { CardWrapper } from 'ui-app/Card'
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
