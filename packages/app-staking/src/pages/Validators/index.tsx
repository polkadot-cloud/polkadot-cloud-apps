// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { onTabVisitEvent } from 'event-tracking'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { PageProps } from 'types'
import { PagePreloader } from 'ui-app/PagePreloader'
import { PageTabs } from 'ui-app/PageTabs'
import { Page } from 'ui-core/base'
import { ValidatorsContent } from './Content'
import { useValidatorsTabs, ValidatorsTabsProvider } from './context'

const ValidatorFavorites = lazy(() =>
	import('./Favorites').then((m) => ({ default: m.ValidatorFavorites })),
)

interface ValidatorsProps extends Partial<PageProps> {
	enableFavorites?: boolean
}

export const ValidatorsInner = ({
	enableFavorites = true,
}: ValidatorsProps) => {
	const { t } = useTranslation('pages')
	const { favorites } = useFavoriteValidators()
	const { activeTab, setActiveTab } = useValidatorsTabs()
	const displayTab = enableFavorites ? activeTab : 0

	// back to tab 0 if not in the first tab
	useEffect(() => {
		if (![0].includes(activeTab)) {
			setActiveTab(0)
		}
	}, [])

	return (
		<>
			<Page.Title title={t('validators')}>
				{enableFavorites && (
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
				)}
			</Page.Title>
			<Suspense fallback={<PagePreloader showStats={displayTab === 0} />}>
				{displayTab === 0 && (
					<ValidatorsContent toggleFavorites={enableFavorites} />
				)}
				{displayTab === 1 && <ValidatorFavorites />}
			</Suspense>
		</>
	)
}

export const Validators = ({ enableFavorites = true }: ValidatorsProps) => (
	<ValidatorsTabsProvider>
		<ValidatorsInner enableFavorites={enableFavorites} />
	</ValidatorsTabsProvider>
)
