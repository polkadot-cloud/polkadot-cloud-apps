// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	type ValidatorSupportedNetwork,
	validatorListSupported,
} from '@w3ux/validator-assets'
import { useNetwork } from 'hooks/useNetwork'
import { PagePreloader } from 'library/PagePreloader'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import type { PageProps } from 'types'
import { Page } from 'ui-core/base'
import { OperatorsSectionsProvider, useOperatorsSections } from './context'
import { Wrapper } from './Wrappers'

const List = lazy(() => import('./List').then((m) => ({ default: m.List })))
const Entity = lazy(() =>
	import('./Entity').then((m) => ({ default: m.Entity })),
)

export const OperatorsInner = ({ page }: PageProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { activeSection } = useOperatorsSections()

	const isSupported = validatorListSupported(network)
	if (!isSupported) {
		return null
	}
	const { key } = page

	return (
		<Wrapper>
			<Page.Title title={t(key)} />
			<Suspense fallback={<PagePreloader showStats={false} />}>
				{activeSection === 0 && (
					<List network={network as ValidatorSupportedNetwork} />
				)}
				{activeSection === 1 && (
					<Entity network={network as ValidatorSupportedNetwork} />
				)}
			</Suspense>
		</Wrapper>
	)
}

export const Operators = (props: PageProps) => (
	<OperatorsSectionsProvider>
		<OperatorsInner {...props} />
	</OperatorsSectionsProvider>
)
