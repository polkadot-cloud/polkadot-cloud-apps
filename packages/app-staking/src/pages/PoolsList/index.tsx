// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { PagePreloader } from 'ui-app/PagePreloader'
import { Page } from 'ui-core/base'

const PoolsOverview = lazy(() =>
	import('./Overview').then((m) => ({ default: m.PoolsOverview })),
)

export const PoolsList = () => {
	const { t } = useTranslation('app')

	return (
		<>
			<Page.Title title={t('pools')} />
			<Suspense fallback={<PagePreloader showStats={false} />}>
				<PoolsOverview />
			</Suspense>
		</>
	)
}
