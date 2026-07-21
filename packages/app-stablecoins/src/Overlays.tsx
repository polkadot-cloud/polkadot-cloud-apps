// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDefaultCategories } from 'hooks/useDefaultCategories'
import type { OverlayLoader } from 'ui-overlay'
import { lazyNamed, Overlay } from 'ui-overlay'

const lazyOverlayComponents = <
	T extends Record<string, OverlayLoader<Record<string, unknown>>>,
>(
	loaders: T,
) =>
	Object.fromEntries(
		Object.entries(loaders).map(([key, load]) => [key, lazyNamed(load, key)]),
	) as Record<keyof T, ReturnType<typeof lazyNamed>>

const modals = lazyOverlayComponents({
	Accounts: () =>
		import('ui-modals/Accounts').then(({ Accounts: AccountsModal }) => ({
			Accounts: () => <AccountsModal useCategories={useDefaultCategories} />,
		})),
	ExternalAccounts: () => import('ui-modals/ExternalAccounts'),
	ImportAccounts: () => import('ui-modals/ImportAccounts'),
	SelectCurrency: () => import('ui-modals/SelectCurrency'),
})

const ErrorFallbackModal = () => null

export const Overlays = () => (
	<Overlay
		fallback={ErrorFallbackModal}
		externalOverlayStatus="closed"
		modals={modals}
		canvas={{}}
	/>
)
