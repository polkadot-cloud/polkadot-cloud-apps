// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { DispatchError, ExtrinsicSignatureV4 } from 'dedot/codecs'
import type { InjectedSigner, PayloadOptions, TxStatus } from 'dedot/types'
import { onTransactionSubmittedEvent } from 'event-tracking'
import type { TxFailure, TxStatusHandlers } from 'types'
import { getErrorKeyFromMessage } from './error'
import { deleteTx, getUid, setUidPending, setUidSubmitted, subs } from './index'

const dispatchFailure = (
	tx: SubmittableExtrinsic,
	error?: DispatchError,
): TxFailure | undefined => {
	if (!error) return
	const metadata =
		error.type === 'Module'
			? tx.client.registry.findErrorMeta(error)
			: undefined

	return {
		type: 'dispatch',
		error,
		module: metadata && { pallet: metadata.pallet, name: metadata.name },
	}
}

export const addSignAndSend = async (
	network: string,
	uid: number,
	from: string,
	tx: SubmittableExtrinsic,
	signer: InjectedSigner,
	nonce: number,
	txStatusHandlers: TxStatusHandlers,
	signerOptions?: Partial<PayloadOptions>,
) => {
	const { onError, ...onRest } = txStatusHandlers
	try {
		const options = {
			...signerOptions,
			signer,
			nonce,
		}

		// Transaction submitted - register tx event
		onTransactionSubmittedEvent(network, getTxLabel(tx))

		subs[uid] = await tx.signAndSend(
			from,
			options,
			async ({ status, dispatchError }) => {
				handleResult(uid, status, onRest, dispatchFailure(tx, dispatchError))
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

		subs[uid] = await tx.send(async ({ status, dispatchError }) => {
			handleResult(uid, status, onRest, dispatchFailure(tx, dispatchError))
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
	}: Omit<TxStatusHandlers, 'onError'>,
	failure?: TxFailure,
) => {
	if (!getUid(uid)) return
	if (failure) {
		onFailed(failure)
		deleteTx(uid)
		return
	}
	if (status.type === 'Broadcasting') {
		setUidPending(uid, true)
		onReady()
	}
	if (status.type === 'BestChainBlockIncluded') {
		// Stop submission indicators before callbacks that may update the UI or throw.
		setUidSubmitted(uid, false)
		setUidPending(uid, false)
		onInBlock()
	}
	if (status.type === 'Finalized') {
		onFinalized()
		deleteTx(uid)
	}
	if (status.type === 'Invalid') {
		onFailed({ type: 'invalid' })
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
