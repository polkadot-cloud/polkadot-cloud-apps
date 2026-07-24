// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { onTabVisitEvent } from 'event-tracking'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { PagePreloader } from 'library/PagePreloader'
import { PageTabs } from 'library/PageTabs'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { useValidatorsTabs, ValidatorsTabsProvider } from './context'

const AllValidators = lazy(() =>
	import('./AllValidators').then((m) => ({ default: m.AllValidators })),
)
const ValidatorFavorites = lazy(() =>
	import('./Favorites').then((m) => ({ default: m.ValidatorFavorites })),
)

export const ValidatorsInner = () => {
	const { t } = useTranslation('pages')
	const { favorites } = useFavoriteValidators()
	const { activeTab, setActiveTab } = useValidatorsTabs()

	// back to tab 0 if not in the first tab
	useEffect(() => {
		if (![0].includes(activeTab)) {
			setActiveTab(0)
		}
	}, [])

	return (
		<>
			<Page.Title title={t('validators')}>
				<PageTabs
					tabs={[
						{
							title: t('allValidators'),
							active: activeTab === 0,
							onClick: () => {
								onTabVisitEvent('validators', 'all_validators')
								setActiveTab(0)
							},
						},
						{
							title: t('favorites'),
							active: activeTab === 1,
							onClick: () => {
								onTabVisitEvent('validators', 'favorites')
								setActiveTab(1)
							},
							badge: String(favorites.length),
						},
					]}
				/>
			</Page.Title>
			<Suspense fallback={<PagePreloader showStats={activeTab === 0} />}>
				{activeTab === 0 && <AllValidators />}
				{activeTab === 1 && <ValidatorFavorites />}
			</Suspense>
		</>
	)
}

export const Validators = () => (
	<ValidatorsTabsProvider>
		<ValidatorsInner />
	</ValidatorsTabsProvider>
)
