// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getPendingCrossChainDeliveries,
	pendingCrossChainDeliveries$,
} from 'global-bus'
import { useSyncExternalStore } from 'react'
import { createObservableStore } from 'utils'

const pendingStore = createObservableStore(
	pendingCrossChainDeliveries$,
	getPendingCrossChainDeliveries,
)

export const useCrossChainDeliveryPending = () =>
	useSyncExternalStore(
		pendingStore.subscribe,
		pendingStore.getSnapshot,
		pendingStore.getSnapshot,
	).length > 0
