// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { usePlugins } from 'hooks/usePlugins'
import { PageTitle } from 'library/PageTitle'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import type { PageProps } from 'types'
import { PagePreloader } from 'ui-app/PagePreloader'

const List = lazy(() => import('./List').then((m) => ({ default: m.List })))

export const Operators = ({ page }: PageProps) => {
	const { t } = useTranslation('app')
	const { pluginEnabled } = usePlugins()
	const { key } = page

	return (
		<>
			<PageTitle title={t(key)} />
			{pluginEnabled('staking_api') && (
				<Suspense fallback={<PagePreloader showStats />}>
					<List />
				</Suspense>
			)}
		</>
	)
}
