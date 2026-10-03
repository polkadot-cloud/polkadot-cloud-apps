// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'
import type { ActiveAccount, ActiveProxy, TxFeeDisplay } from 'types'

export type TxFeeEstimatorInput = {
	tx: SubmittableExtrinsic
	from: string
	feePaymentOptions?: PayloadOptions
}

export type TxFeeEstimator = (input: TxFeeEstimatorInput) => Promise<bigint>

export interface UseSubmitExtrinsicProps {
	tx: SubmittableExtrinsic | undefined
	tag?: string
	dappName?: string
	from: {
		address: string | null
		source: string | null
		proxy?: ActiveProxy | null
	}
	shouldSubmit: boolean
	feePaymentOptions?: PayloadOptions
	feeEstimator?: TxFeeEstimator
	feeDisplay?: TxFeeDisplay
	callbackSubmit?: () => void
	callbackInBlock?: () => void
}

export interface UseSubmitExtrinsic {
	txInitiated: boolean
	uid: number
	onSubmit: () => void
	proxySupported: boolean
	submitAccount: ActiveAccount
	proxyAccount: ActiveProxy | null
}
