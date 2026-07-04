// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDefaultCategories } from 'hooks/useDefaultCategories'
import type { ComponentType } from 'react'
import { lazy } from 'react'
import { Overlay } from 'ui-overlay'

type OverlayLoader<TModule = Record<string, unknown>> = () => Promise<TModule>

const lazyNamed = <TModule extends Record<string, unknown>>(
	load: OverlayLoader<TModule>,
	exportName: string,
) =>
	lazy(async () => {
		const module = await load()
		const component = module[exportName]

		if (!component) {
			throw new Error(`Missing overlay export: ${exportName}`)
		}

		if (typeof component !== 'function') {
			throw new Error(
				`Export ${exportName} is not a component (expected function, got ${typeof component})`,
			)
		}

		return { default: component as ComponentType }
	})

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
