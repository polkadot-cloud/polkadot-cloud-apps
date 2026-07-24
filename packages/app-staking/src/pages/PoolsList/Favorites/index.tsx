// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider } from 'contexts/List'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useApi } from 'hooks/useApi'
import { useFavoritePools } from 'hooks/useFavoritePools'
import { useSyncing } from 'hooks/useSyncing'
import { CardWrapper } from 'library/Card/Wrappers'
import { ListStatusHeader } from 'library/List'
import { PoolList } from 'library/PoolList'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { Page } from 'ui-core/base'

export const PoolFavorites = () => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const { bondedPools } = useBondedPools()
	const { syncing } = useSyncing(['active-pools'])
	const { favorites, removeFavorite } = useFavoritePools()

	// Store local favorite list and update when favorites list is mutated.
	const [favoritesList, setFavoritesList] = useState<BondedPool[]>([])

	useEffect(() => {
		// map favorites to bonded pools
		const newFavoritesList = favorites
			.map((f) => {
				const pool = bondedPools.find((b) => b.addresses.stash === f)
				if (!pool) {
					removeFavorite(f)
				}
				return pool
			})
			.filter((f): f is BondedPool => f !== undefined)

		// filter not found bonded pools
		setFavoritesList(newFavoritesList)
	}, [favorites])

	return (
		<Page.Row>
			<CardWrapper>
				{favoritesList === null || syncing ? (
					<ListStatusHeader>{t('fetchingFavoritePools')}...</ListStatusHeader>
				) : (
					isReady &&
					(favoritesList.length > 0 ? (
						<ListProvider>
							<PoolList pools={favoritesList} allowMoreCols itemsPerPage={50} />
						</ListProvider>
					) : (
						<ListStatusHeader>{t('noFavorites')}</ListStatusHeader>
					))
				)}
			</CardWrapper>
		</Page.Row>
	)
}
