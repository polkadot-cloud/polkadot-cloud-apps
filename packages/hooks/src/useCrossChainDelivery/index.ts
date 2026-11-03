// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	type CrossChainDeliveryState,
	getPendingCrossChainDeliveries,
	pendingCrossChainDeliveries$,
} from 'global-bus'
import { useMemo, useSyncExternalStore } from 'react'
import { createObservableStore } from 'utils'

const pendingStore = createObservableStore(
	pendingCrossChainDeliveries$,
	getPendingCrossChainDeliveries,
)
const emptyStore = {
	subscribe: () => () => {},
	getSnapshot: () => undefined,
}

export const useCrossChainDeliveryPending = () =>
	useSyncExternalStore(
		pendingStore.subscribe,
		pendingStore.getSnapshot,
		pendingStore.getSnapshot,
	).length > 0

export const useCrossChainDeliveryStage = (
	delivery?: CrossChainDeliveryState,
) => {
	const store = useMemo(
		() =>
			delivery
				? createObservableStore(delivery.stage$, delivery.getStage)
				: emptyStore,
		[delivery],
	)
	return useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	)
}
