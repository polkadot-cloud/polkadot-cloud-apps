// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SubmittableExtrinsic } from 'dedot'
import { updateFee } from 'global-bus'
import { useEffect } from 'react'
import { stringifyWithBigInt } from '../util'
import type { UseTxFeeProps } from './types'

// Keeps a submission's fee in sync with its transaction, signer, and payment options.
export const useTxFee = ({
	uid,
	tx,
	from,
	feePaymentOptions,
	feeEstimator,
	estimatedFee,
}: UseTxFeeProps) => {
	const txHex = tx?.toHex()
	const client = tx?.client
	const feePaymentOptionsKey = stringifyWithBigInt(feePaymentOptions)

	useEffect(() => {
		if (uid <= 0) return
		if (estimatedFee !== undefined) {
			updateFee(uid, estimatedFee)
			return
		}
		if (!tx || !from) return

		let stale = false
		updateFee(uid, 0n)
		const estimate = async () => {
			try {
				const feeTx = SubmittableExtrinsic.fromTx(
					tx.client as Parameters<typeof SubmittableExtrinsic.fromTx>[0],
					tx.call,
				)
				const fee = feeEstimator
					? await feeEstimator({ tx: feeTx, from, feePaymentOptions })
					: (await feeTx.paymentInfo(from, feePaymentOptions)).partialFee
				if (!stale) updateFee(uid, fee)
			} catch {
				if (!stale) updateFee(uid, 0n)
			}
		}
		void estimate()

		return () => {
			stale = true
		}
	}, [
		uid,
		txHex,
		client,
		from,
		feePaymentOptionsKey,
		feeEstimator,
		estimatedFee,
	])
}
