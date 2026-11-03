// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createCrossChainDeliveryState } from 'global-bus'
import type {
	CrossChainDeliveryStage,
	CrossChainTransfer,
	CrossChainTransferInput,
	ServiceInterface,
} from 'types'

// Tracking belongs to the submitted transfer, so changing or unmounting the form cannot stop it.
export const trackCrossChainDelivery = (
	serviceApi: ServiceInterface,
	input: CrossChainTransferInput,
	quote: CrossChainTransfer,
) => {
	const { recipient, to, symbol } = input
	const expectedBalance = quote.destinationBalance + quote.receivedAmount
	const delivery = createCrossChainDeliveryState()
	let received = false
	let finalized = false
	let finished = false
	let subscriptionFailed = false
	let unsubscribe = () => {}
	let timeout: ReturnType<typeof setTimeout> | undefined

	const finish = (nextStage: CrossChainDeliveryStage | undefined) => {
		if (finished) return
		finished = true
		clearTimeout(timeout)
		unsubscribe()
		delivery.setStage(nextStage)
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
		state: delivery.state,
		finalized: () => {
			if (finished || finalized) return
			finalized = true
			if (received) {
				finish('balanceUpdated')
			} else if (subscriptionFailed) {
				finish('unconfirmed')
			} else {
				delivery.setStage('finalized')
				timeout = setTimeout(() => finish('unconfirmed'), 120_000)
			}
		},
		failed: () => finish(undefined),
	}
}
