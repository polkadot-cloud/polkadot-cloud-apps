// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtensionInjected } from '@polkadot-cloud/connect-core/types'

declare global {
	interface Window {
		injectedWeb3?: Record<string, ExtensionInjected>
		opera?: boolean
	}
}
