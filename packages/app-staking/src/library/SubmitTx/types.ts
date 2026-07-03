// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { VaultSignatureResult } from '@polkadot-cloud/connect-vault'
import type {
	ActiveAccount,
	ActiveProxy,
	DisplayFor,
	MaybeAddress,
} from 'types'

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
	}

export interface SubmitProps {
	uid: number
	onSubmit: () => void
	valid: boolean
	submitText?: string
	submitAccount: ActiveAccount
	displayFor?: DisplayFor
}

export interface SignerPromptProps {
	submitAddress: MaybeAddress
	toSign: Uint8Array
	onComplete: (
		status: 'complete' | 'cancelled',
		signature: VaultSignatureResult,
	) => void
}

export interface SubmitButtonProps {
	displayFor?: DisplayFor
	text: string
	icon?: IconProp
	onSubmit: () => void | Promise<void>
	disabled: boolean
	pulse?: boolean
	iconTransform?: string
	fee?: React.ReactNode
}
