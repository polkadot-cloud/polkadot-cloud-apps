// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { lazy, Suspense } from 'react'
import { PagePreloader } from 'ui-app/PagePreloader'

const ValidatorsNode = lazy(() =>
	import('./ValidatorsNode').then((m) => ({ default: m.ValidatorsNode })),
)
const ValidatorsAPI = lazy(() =>
	import('./ValidatorsAPI').then((m) => ({
		default: m.ValidatorsAPI,
	})),
)

export const ValidatorsContent = ({
	toggleFavorites,
}: {
	toggleFavorites: boolean
}) => {
	const retainmentStatsEnabled = useRetainmentStatsEnabled()

	return (
		<Suspense fallback={<PagePreloader showStats />}>
			{retainmentStatsEnabled ? (
				<ValidatorsAPI toggleFavorites={toggleFavorites} />
			) : (
				<ValidatorsNode toggleFavorites={toggleFavorites} />
			)}
		</Suspense>
	)
}
