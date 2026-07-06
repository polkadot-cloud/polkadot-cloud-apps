// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActiveAccount, ActiveProxy, MaybeAddress } from './accounts'
import type { DisplayFor } from './overlay'

export type TxSubmissionItem = {
	uid: number
	network: string
	tag?: string
	fee: bigint
	from: MaybeAddress
	submitted: boolean
	pending: boolean
}

export type TxFeeDisplay = {
	unit: string
	units: number
}

export interface TxStatusHandlers {
	onReady: () => void
	onInBlock: () => void
	onFinalized: () => void
	onFailed: (err: Error) => void
	onError: (type?: string, details?: string) => void
}

export interface ProxySwitcherProps {
	onPreviousSigner?: () => void
	onNextSigner?: () => void
	hasMultipleSigners?: boolean
}

export type SubmitTxProps = SubmitProps &
	ProxySwitcherProps & {
		requiresMigratedController?: boolean
		proxySupported: boolean
		noMargin?: boolean
		onResize?: () => void
		transparent?: boolean
		txInitiated: boolean
		proxyAccount: ActiveProxy | null
		stacked?: boolean
		feeDisplay?: TxFeeDisplay
		feeBalance?: bigint
		hideSigner?: boolean
	}

export interface SubmitProps {
	uid: number
	onSubmit: () => void
	valid: boolean
	submitText?: string
	submitAccount: ActiveAccount
	displayFor?: DisplayFor
}
