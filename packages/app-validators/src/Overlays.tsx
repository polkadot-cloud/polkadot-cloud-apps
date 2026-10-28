// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ErrorFallbackModal } from 'ui-app/ErrorBoundary'
import { lazyNamed, Overlay } from 'ui-overlay'

const ValidatorMetrics = lazyNamed(
	() => import('canvas/ValidatorMetrics'),
	'ValidatorMetrics',
)
const OperatorValidators = lazyNamed(
	() => import('canvas/OperatorValidators'),
	'OperatorValidators',
)
const DiscordSupport = lazyNamed(
	() => import('ui-modals/DiscordSupport'),
	'DiscordSupport',
)
const MailSupport = lazyNamed(
	() => import('ui-modals/MailSupport'),
	'MailSupport',
)
const RetainmentHistory = lazyNamed(
	() => import('ui-modals/RetainmentHistory'),
	'RetainmentHistory',
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
		canvas={{ OperatorValidators, ValidatorMetrics }}
		modals={{
			DiscordSupport,
			MailSupport,
			RetainmentHistory,
			SelectCurrency,
			SelectLanguage,
		}}
	/>
)
