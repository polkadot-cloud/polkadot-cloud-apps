// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidatorDetailsEnabled } from 'hooks/useValidatorDetailsEnabled'
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
	showShareLink = true,
	toggleFavorites,
}: {
	showShareLink?: boolean
	toggleFavorites: boolean
}) => {
	const validatorDetailsEnabled = useValidatorDetailsEnabled()

	return (
		<Suspense fallback={<PagePreloader showStats />}>
			{validatorDetailsEnabled ? (
				<ValidatorsAPI
					showShareLink={showShareLink}
					toggleFavorites={toggleFavorites}
				/>
			) : (
				<ValidatorsNode
					showShareLink={showShareLink}
					toggleFavorites={toggleFavorites}
				/>
			)}
		</Suspense>
	)
}
