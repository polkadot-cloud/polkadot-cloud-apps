// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { activeProxy$ } from '@polkadot-cloud/connect-proxies'
import { useSyncExternalStore } from 'react'
import type { ActiveProxy } from 'types'
import { createObservableStore } from 'utils'
import type { ActiveProxyHookInterface } from './types'

const activeProxyStore = createObservableStore<ActiveProxy | null>(
	activeProxy$,
	null,
)

export const useActiveProxy = (): ActiveProxyHookInterface => {
	const activeProxy = useSyncExternalStore(
		activeProxyStore.subscribe,
		activeProxyStore.getSnapshot,
		activeProxyStore.getSnapshot,
	)

	return {
		activeProxy,
		activeProxyType: activeProxy?.proxyType || null,
	}
}
