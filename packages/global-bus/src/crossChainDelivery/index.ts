// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { CrossChainDeliveryStage } from 'types'
import { _pendingCrossChainDeliveries } from './private'

let nextId = 0

export const pendingCrossChainDeliveries$ =
	_pendingCrossChainDeliveries.asObservable()

export const getPendingCrossChainDeliveries = () =>
	_pendingCrossChainDeliveries.getValue()

// Each transfer retains its own status; the shared list contains only pending deliveries.
export const createCrossChainDeliveryState = () => {
	const id = ++nextId
	const stage = new BehaviorSubject<CrossChainDeliveryStage | undefined>(
		'submitted',
	)
	_pendingCrossChainDeliveries.next([...getPendingCrossChainDeliveries(), id])

	return {
		state: {
			stage$: stage.asObservable(),
			getStage: () => stage.getValue(),
		},
		setStage: (nextStage: CrossChainDeliveryStage | undefined) => {
			if (!getPendingCrossChainDeliveries().includes(id)) return
			stage.next(nextStage)
			if (nextStage !== 'submitted' && nextStage !== 'finalized') {
				_pendingCrossChainDeliveries.next(
					getPendingCrossChainDeliveries().filter(
						(pendingId) => pendingId !== id,
					),
				)
			}
		},
	}
}

export type CrossChainDeliveryState = ReturnType<
	typeof createCrossChainDeliveryState
>['state']
