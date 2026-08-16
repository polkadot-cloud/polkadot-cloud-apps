// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ErrorFallbackModal } from 'ui-app/ErrorBoundary'
import { lazyNamed, Overlay } from 'ui-overlay'

const ValidatorMetrics = lazyNamed(
	() => import('canvas/ValidatorMetrics'),
	'ValidatorMetrics',
)

export const Overlays = () => (
	<Overlay
		fallback={ErrorFallbackModal}
		externalOverlayStatus="closed"
		canvas={{ ValidatorMetrics }}
		modals={{}}
	/>
)
