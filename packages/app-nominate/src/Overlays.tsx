// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ErrorFallbackModal } from 'ui-app/ErrorBoundary'
import { lazyNamed, Overlay, type OverlayLoader } from 'ui-overlay'

const lazyOverlayComponents = <
	T extends Record<string, OverlayLoader<Record<string, unknown>>>,
>(
	loaders: T,
) =>
	Object.fromEntries(
		Object.entries(loaders).map(([key, load]) => [key, lazyNamed(load, key)]),
	) as Record<keyof T, ReturnType<typeof lazyNamed>>

const modals = lazyOverlayComponents({
	Accounts: () => import('ui-modals/Accounts'),
	DiscordSupport: () => import('ui-modals/DiscordSupport'),
	ExternalAccounts: () => import('ui-modals/ExternalAccounts'),
	ImportAccounts: () => import('ui-modals/ImportAccounts'),
	MailSupport: () => import('ui-modals/MailSupport'),
	RetainmentHistory: () => import('ui-modals/RetainmentHistory'),
	SelectCurrency: () => import('ui-modals/SelectCurrency'),
	SelectLanguage: () => import('ui-modals/SelectLanguage'),
})

const canvas = lazyOverlayComponents({
	ValidatorMetrics: () => import('canvas/ValidatorMetrics'),
})

export const Overlays = () => (
	<Overlay
		fallback={ErrorFallbackModal}
		externalOverlayStatus="closed"
		canvas={canvas}
		modals={modals}
	/>
)
