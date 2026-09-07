// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDataCapabilities } from 'data-gate/react'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import type { PageProps } from 'types'
import { PagePreloader } from 'ui-app/PagePreloader'
import { Page } from 'ui-core/base'

const List = lazy(() => import('./List').then((m) => ({ default: m.List })))

export const Operators = ({ page }: PageProps) => {
	const { t } = useTranslation('app')
	const { stakingApi: stakingApiEnabled } = useDataCapabilities()
	const { key } = page

	return (
		<>
			<Page.Title title={t(key)} />
			{stakingApiEnabled && (
				<Suspense fallback={<PagePreloader showStats />}>
					<List />
				</Suspense>
			)}
		</>
	)
}
