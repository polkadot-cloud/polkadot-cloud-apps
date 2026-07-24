// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActiveProxy } from 'types'

export interface ActiveProxyHookInterface {
	activeProxy: ActiveProxy | null
	activeProxyType: string | null
}
