// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MaybeAddress } from 'types'

export type TxSubmissionItem = {
	uid: number
	tag?: string
	fee: bigint
	from: MaybeAddress
	submitted: boolean
	pending: boolean
}

export interface TxStatusHandlers {
	onReady: () => void
	onInBlock: () => void
	onFinalized: () => void
	onFailed: (err: Error) => void
	onError: (type?: string) => void
}
