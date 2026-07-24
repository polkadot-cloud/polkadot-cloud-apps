// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MaybeString } from '@w3ux/types'
import type { AnyJson } from './common'
import type { NetworkId } from './networks'

/**
 * Supported Ledger device models.
 */
export type LedgerDeviceModel =
	| 'nano_s'
	| 'nano_x'
	| 'nano_s_plus'
	| 'flex'
	| 'stax'
	| 'unknown'

/**
 * Device family grouping: nano (button-based) vs touchscreen.
 */
export type LedgerDeviceFamily = 'nano' | 'touchscreen' | 'unknown'

export interface FeedbackMessage {
	message: MaybeString
	helpKey?: MaybeString
}

export type LedgerStatusCode =
	| 'GettingAddress'
	| 'ReceivedAddress'
	| 'SigningPayload'
	| 'SignedPayload'
	| 'DeviceBusy'
	| 'DeviceTimeout'
	| 'MethodNotSupported'
	| 'NestingNotSupported'
	| 'WrongTransaction'
	| 'DeviceNotConnected'
	| 'DeviceLocked'
	| 'TransactionVersionNotSupported'
	| 'TransactionRejected'
	| 'AppNotOpenContinue'
	| 'AppNotOpen'

export interface LedgerResponse {
	ack: string
	statusCode: LedgerStatusCode
	body?: AnyJson
	device?: {
		deviceModel?: LedgerDeviceModel
	}
	options?: AnyJson
}

export type LedgerTask = 'get_address' | 'sign_tx'

export type PairingStatus = 'paired' | 'unpaired' | 'unknown'

export interface LedgerAddress {
	address: string
	index: number
	name: string
	network: NetworkId
	pubKey: string
}

export interface LedgerDeviceAddress {
	address: string
	pubKey: string
	deviceModel?: LedgerDeviceModel
}

export interface HandleErrorFeedback {
	message: MaybeString
	helpKey?: MaybeString
	code: LedgerStatusCode
}
