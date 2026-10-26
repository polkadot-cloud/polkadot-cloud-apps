// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DispatchError } from 'dedot/codecs'
import type { ActiveAccount, ActiveProxy, MaybeAddress } from './accounts'
import type { DisplayFor } from './overlay'

export type TxSubmissionItem = {
	uid: number
	network: string
	tag?: string
	fee: bigint
	from: MaybeAddress
	submitted: boolean
	// Remains true after broadcast, including while waiting for finality.
	broadcasted: boolean
	pending: boolean
}

export type TxFeeDisplay = {
	unit: string
	units: number
}

// A rejected transaction or runtime dispatch error, with its decoded pallet identity when
// available.
export type TxFailure =
	| {
			type: 'dispatch'
			error: DispatchError
			module?: { pallet: string; name: string }
	  }
	| { type: 'invalid' }

export interface TxStatusHandlers {
	onReady: () => void
	onInBlock: () => void
	onFinalized: () => void
	onFailed: (failure: TxFailure) => void
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
