// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider } from 'contexts/List'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useFavoritePools } from 'hooks/useFavoritePools'
import { ListStatusHeader } from 'library/List'
import { PoolList } from 'library/PoolList'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { CardWrapper } from 'ui-app/Card'
import { Page } from 'ui-core/base'

export const PoolFavorites = () => {
	const { t } = useTranslation('pages')
	const { bondedPools, bondedPoolsStatus } = useBondedPools()
	const { favorites } = useFavoritePools()

	// Resolve favorites whenever the shared pool snapshot changes. Missing data during
	// loading must never remove a saved favorite.
	const favoritesList = useMemo(
		() =>
			favorites
				.map((stash) =>
					bondedPools.find((pool) => pool.addresses.stash === stash),
				)
				.filter((pool): pool is BondedPool => pool !== undefined),
		[favorites, bondedPools],
	)

	return (
		<Page.Row>
			<CardWrapper>
				{!favoritesList.length && bondedPoolsStatus === 'pending' ? (
					<ListStatusHeader>{t('fetchingFavoritePools')}...</ListStatusHeader>
				) : favoritesList.length > 0 ? (
					<ListProvider>
						<PoolList pools={favoritesList} allowMoreCols itemsPerPage={50} />
					</ListProvider>
				) : (
					<ListStatusHeader>
						{bondedPoolsStatus === 'error'
							? t('errorUnknown', { ns: 'app' })
							: t('noFavorites')}
					</ListStatusHeader>
				)}
			</CardWrapper>
		</Page.Row>
	)
}
