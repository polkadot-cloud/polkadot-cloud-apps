// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ErrorFallbackModal } from 'ui-app/ErrorBoundary'
import { lazyNamed, Overlay } from 'ui-overlay'

const ValidatorMetrics = lazyNamed(
	() => import('canvas/ValidatorMetrics'),
	'ValidatorMetrics',
)
const DiscordSupport = lazyNamed(
	() => import('ui-modals/DiscordSupport'),
	'DiscordSupport',
)
const MailSupport = lazyNamed(
	() => import('ui-modals/MailSupport'),
	'MailSupport',
)
const SelectCurrency = lazyNamed(
	() => import('ui-modals/SelectCurrency'),
	'SelectCurrency',
)
const SelectLanguage = lazyNamed(
	() => import('ui-modals/SelectLanguage'),
	'SelectLanguage',
)

export const Overlays = () => (
	<Overlay
		fallback={ErrorFallbackModal}
		externalOverlayStatus="closed"
		canvas={{ ValidatorMetrics }}
		modals={{ DiscordSupport, MailSupport, SelectCurrency, SelectLanguage }}
	/>
)
