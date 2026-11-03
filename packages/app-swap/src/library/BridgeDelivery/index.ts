// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSyncExternalStore } from 'react'
import { BehaviorSubject } from 'rxjs'
import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	ServiceInterface,
} from 'types'
import { createObservableStore } from 'utils'

type DeliveryStage =
	| 'submitted'
	| 'finalized'
	| 'balanceUpdated'
	| 'unconfirmed'
	| undefined

const pendingDeliveries = new BehaviorSubject(0)
const pendingStore = createObservableStore(pendingDeliveries, () =>
	pendingDeliveries.getValue(),
)

export const useCrossChainDeliveryPending = () =>
	useSyncExternalStore(
		pendingStore.subscribe,
		pendingStore.getSnapshot,
		pendingStore.getSnapshot,
	) > 0

// Tracking belongs to the submitted transfer, so changing or unmounting the form cannot stop it.
export const trackCrossChainDelivery = (
	serviceApi: ServiceInterface,
	input: CrossChainTransferInput,
	quote: CrossChainTransfer,
) => {
	const { recipient, to, symbol } = input
	const expectedBalance = quote.destinationBalance + quote.receivedAmount
	const stage = new BehaviorSubject<DeliveryStage>('submitted')
	const store = createObservableStore(stage, () => stage.getValue())
	let received = false
	let finalized = false
	let finished = false
	let subscriptionFailed = false
	let unsubscribe = () => {}
	let timeout: ReturnType<typeof setTimeout> | undefined
	pendingDeliveries.next(pendingDeliveries.getValue() + 1)

	const finish = (nextStage: DeliveryStage) => {
		if (finished) return
		finished = true
		clearTimeout(timeout)
		unsubscribe()
		stage.next(nextStage)
		pendingDeliveries.next(pendingDeliveries.getValue() - 1)
		if (nextStage === 'balanceUpdated') {
			void serviceApi.stablecoins.query
				.balances(recipient)
				.catch(() => undefined)
		}
	}
	const onError = () => {
		if (finished) return
		subscriptionFailed = true
		if (finalized) finish('unconfirmed')
	}
	try {
		unsubscribe = serviceApi.stablecoins.subscribe.balances(
			recipient,
			to,
			(balance) => {
				if (
					finished ||
					balance.chain !== to ||
					balance.symbol !== symbol ||
					balance.free < expectedBalance
				)
					return
				received = true
				if (finalized) finish('balanceUpdated')
			},
			onError,
		)
	} catch {
		onError()
	}

	return {
		...store,
		finalized: () => {
			if (finished || finalized) return
			finalized = true
			if (received) {
				finish('balanceUpdated')
			} else if (subscriptionFailed) {
				finish('unconfirmed')
			} else {
				stage.next('finalized')
				timeout = setTimeout(() => finish('unconfirmed'), 120_000)
			}
		},
		failed: () => finish(undefined),
	}
}

const subscribeEmpty = () => () => {}
const getEmptyStage = () => undefined

export const useCrossChainDeliveryStage = (
	delivery?: ReturnType<typeof trackCrossChainDelivery>,
) =>
	useSyncExternalStore(
		delivery?.subscribe ?? subscribeEmpty,
		delivery?.getSnapshot ?? getEmptyStage,
		delivery?.getSnapshot ?? getEmptyStage,
	)
