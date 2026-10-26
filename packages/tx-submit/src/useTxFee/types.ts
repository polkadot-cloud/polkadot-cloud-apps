// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'

// Transaction, signer address, and payment options passed to a custom fee estimator.
export type TxFeeEstimatorInput = {
	tx: SubmittableExtrinsic
	from: string
	feePaymentOptions?: PayloadOptions
}

// Calculates a transaction fee asynchronously in the selected fee asset's base units.
export type TxFeeEstimator = (input: TxFeeEstimatorInput) => Promise<bigint>

// Fee inputs shared by estimation and transaction submission.
export interface TxFeeOptions {
	feePaymentOptions?: PayloadOptions
	feeEstimator?: TxFeeEstimator
	// Fee already estimated for this exact call, applied without a loading reset.
	estimatedFee?: bigint
}

// Submission ID, transaction, signer, and fee inputs used to keep the stored fee up to date.
export interface UseTxFeeProps extends TxFeeOptions {
	uid: number
	tx: SubmittableExtrinsic | undefined
	from: string | undefined
}
