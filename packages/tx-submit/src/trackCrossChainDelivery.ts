// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CrossChainDeliveryTimeoutMs } from 'consts/crossChain'
import {
	addPendingCrossChainDelivery,
	removePendingCrossChainDelivery,
} from 'global-bus'
import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	ServiceInterface,
} from 'types'
import { reserveCrossChainReceipt } from './crossChainDeliveryBalances'

// Tracking belongs to the submitted transfer, so changing or unmounting the form cannot stop it.
export const trackCrossChainDelivery = (
	serviceApi: ServiceInterface,
	input: CrossChainTransferInput,
	quote: CrossChainTransfer,
	{
		onDelivered,
		onUnconfirmed,
	}: {
		onDelivered?: () => void
		onUnconfirmed?: () => void
	} = {},
) => {
	const { recipient, to, symbol } = input
	const deliveryId = addPendingCrossChainDelivery()
	let received = false
	let finalized = false
	let finished = false
	let subscriptionFailed = false
	let unsubscribe = () => {}
	let timeout: ReturnType<typeof setTimeout> | undefined

	const finish = (outcome?: 'delivered' | 'unconfirmed') => {
		if (finished) return
		finished = true
		clearTimeout(timeout)
		try {
			unsubscribe()
		} catch {
			// Cleanup must not interrupt terminal callbacks or transaction notifications.
		}
		removePendingCrossChainDelivery(deliveryId)
		if (outcome === undefined) receipt.cancel()
		else receipt.stop()
		if (outcome === 'delivered') {
			onDelivered?.()
			void serviceApi.stablecoins.query
				.balances(recipient)
				.catch(() => undefined)
		} else if (outcome === 'unconfirmed') {
			onUnconfirmed?.()
		}
	}
	const onError = () => {
		if (finished) return
		subscriptionFailed = true
		if (finalized) finish('unconfirmed')
	}
	const receipt = reserveCrossChainReceipt(input, quote, () => {
		received = true
		if (finalized) finish('delivered')
	})
	try {
		unsubscribe = serviceApi.stablecoins.subscribe.balances(
			recipient,
			to,
			(balance) => {
				if (finished || balance.chain !== to || balance.symbol !== symbol)
					return
				receipt.update(balance.free)
			},
			onError,
		)
	} catch {
		onError()
	}

	return {
		finalized: () => {
			if (finished || finalized) return
			finalized = true
			if (received) {
				finish('delivered')
			} else if (subscriptionFailed) {
				finish('unconfirmed')
			} else {
				timeout = setTimeout(
					() => finish('unconfirmed'),
					CrossChainDeliveryTimeoutMs,
				)
			}
		},
		failed: () => finish(),
	}
}
