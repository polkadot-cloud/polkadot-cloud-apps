// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { ExtrinsicSignatureV4 } from 'dedot/codecs'
import type { InjectedSigner, TxStatus } from 'dedot/types'
import { onTransactionSubmittedEvent } from 'event-tracking'
import type { TxStatusHandlers } from 'types'
import { getErrorKeyFromMessage } from './error'
import { deleteTx, setUidPending, setUidSubmitted, subs } from './index'

export const addSignAndSend = async (
	network: string,
	uid: number,
	from: string,
	tx: SubmittableExtrinsic,
	signer: InjectedSigner,
	nonce: number,
	txStatusHandlers: TxStatusHandlers,
) => {
	const { onError, ...onRest } = txStatusHandlers
	try {
		// Transaction submitted - register tx event
		onTransactionSubmittedEvent(network, getTxLabel(tx))

		subs[uid] = await tx.signAndSend(
			from,
			{ signer, nonce },
			async ({ status }) => {
				handleResult(uid, status, onRest)
			},
		)
	} catch (e) {
		handleError(String(e), onError)
		setUidSubmitted(uid, false)
		setUidPending(uid, false)
	}
}

export const addSend = async (
	network: string,
	uid: number,
	tx: SubmittableExtrinsic,
	// biome-ignore lint/suspicious/noExplicitAny: <>
	signature: ExtrinsicSignatureV4<any, any, any>,
	{ onError, ...onRest }: TxStatusHandlers,
) => {
	tx.attachSignature(signature)
	try {
		// Transaction submitted - register tx event
		onTransactionSubmittedEvent(network, getTxLabel(tx))

		subs[uid] = await tx.send(async ({ status }) => {
			handleResult(uid, status, onRest)
		})
	} catch (e) {
		handleError(String(e), onError)
		setUidSubmitted(uid, false)
		setUidPending(uid, false)
	}
}

export const handleResult = (
	uid: number,
	status: TxStatus,
	{
		onReady,
		onInBlock,
		onFinalized,
		onFailed,
	}: {
		onReady: () => void
		onInBlock: () => void
		onFinalized: () => void
		onFailed: (err: Error) => void
	},
) => {
	if (status.type === 'Broadcasting') {
		setUidPending(uid, true)
		onReady()
	}
	if (status.type === 'BestChainBlockIncluded') {
		onInBlock()
		setUidSubmitted(uid, false)
		setUidPending(uid, false)
	}
	if (status.type === 'Finalized') {
		onFinalized()
		deleteTx(uid)
	}
	if (status.type === 'Invalid') {
		onFailed(Error('Invalid transaction'))
		deleteTx(uid)
	}
}

export const handleError = (
	errorMessage: string,
	onError: (type?: string, details?: string) => void,
) => {
	const msgLower = errorMessage.toLowerCase()

	if (
		/user rejected|cancel(l)?ed|cancel(l)?ed by user|usercancel/.test(msgLower)
	) {
		onError('user_cancelled')
	} else if (
		/insufficient|balance|insufficientbalance|not enough/.test(msgLower)
	) {
		onError('insufficient_funds')
	} else {
		// Enhanced technical error classification
		const technicalDetails = getErrorKeyFromMessage(errorMessage)
		onError('technical', technicalDetails)
	}
}

export const getTxLabel = (tx: SubmittableExtrinsic): string => {
	return `${tx.call.pallet}.${tx.call.palletCall.name}`
}
