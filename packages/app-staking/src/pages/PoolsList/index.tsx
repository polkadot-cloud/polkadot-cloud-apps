// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { onTabVisitEvent } from 'event-tracking'
import { useFavoritePools } from 'hooks/useFavoritePools'
import { useNetwork } from 'hooks/useNetwork'
import { PagePreloader } from 'library/PagePreloader'
import { PageTabs } from 'library/PageTabs'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { PoolsTabsProvider, usePoolsTabs } from './context'

const PoolsOverview = lazy(() =>
	import('./Overview').then((m) => ({ default: m.PoolsOverview })),
)
const PoolFavorites = lazy(() =>
	import('./Favorites').then((m) => ({ default: m.PoolFavorites })),
)

const PoolsListInner = () => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { favorites } = useFavoritePools()
	const { activeTab, setActiveTab } = usePoolsTabs()

	// Go back to tab 0 on network change
	useEffect(() => {
		setActiveTab(0)
	}, [network])

	return (
		<>
			<Page.Title title={t('pools', { ns: 'app' })}>
				<PageTabs
					tabs={[
						{
							title: t('overview'),
							active: activeTab === 0,
							onClick: () => {
								onTabVisitEvent('pools_list', 'overview')
								setActiveTab(0)
							},
						},
						{
							title: t('favorites'),
							active: activeTab === 1,
							onClick: () => {
								onTabVisitEvent('pools_list', 'favorites')
								setActiveTab(1)
							},
							badge: String(favorites.length),
						},
					]}
				/>
			</Page.Title>
			<Suspense fallback={<PagePreloader showStats={false} />}>
				{activeTab === 0 && <PoolsOverview />}
				{activeTab === 1 && <PoolFavorites />}
			</Suspense>
		</>
	)
}

export const PoolsList = () => (
	<PoolsTabsProvider>
		<PoolsListInner />
	</PoolsTabsProvider>
)
