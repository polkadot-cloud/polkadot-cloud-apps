// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { _pendingCrossChainDeliveries } from './private'

let nextId = 0

export const pendingCrossChainDeliveries$ =
	_pendingCrossChainDeliveries.asObservable()

export const getPendingCrossChainDeliveries = () =>
	_pendingCrossChainDeliveries.getValue()

export const addPendingCrossChainDelivery = () => {
	const id = ++nextId
	_pendingCrossChainDeliveries.next([...getPendingCrossChainDeliveries(), id])
	return id
}

export const removePendingCrossChainDelivery = (id: number) => {
	_pendingCrossChainDeliveries.next(
		getPendingCrossChainDeliveries().filter((pendingId) => pendingId !== id),
	)
}
