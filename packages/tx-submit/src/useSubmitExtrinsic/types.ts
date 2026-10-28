// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { ActiveAccount, ActiveProxy, TxFeeDisplay } from 'types'
import type { TxFeeOptions } from '../useTxFee/types'

export interface UseSubmitExtrinsicProps extends TxFeeOptions {
	tx: SubmittableExtrinsic | undefined
	tag?: string
	dappName?: string
	from: {
		address: string | null
		source: string | null
		proxy?: ActiveProxy | null
	}
	shouldSubmit: boolean
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
