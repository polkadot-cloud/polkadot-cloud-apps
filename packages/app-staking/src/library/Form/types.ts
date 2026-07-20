// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import type { ReactNode } from 'react'
import type { BondFor, ClaimPermission } from 'types'

export type ValueSetter = ({ value }: { value: BigNumber }) => void

export interface BondFeedbackProps {
	syncing?: boolean
	setters: ValueSetter[]
	bondFor: BondFor
	defaultBond: string | null
	bonding?: boolean
	joiningPool?: boolean
	listenIsValid?: ((valid: boolean, errors: string[]) => void) | (() => void)
	parentErrors?: string[]
	disableTxFeeUpdate?: boolean
	setLocalResize?: () => void
	txFees: bigint
	maxWidth?: boolean
	displayFirstWarningOnly?: boolean
}

export interface UnbondFeedbackProps {
	setters: ValueSetter[]
	bondFor: BondFor
	defaultBond?: number
	inSetup?: boolean
	listenIsValid?: ((valid: boolean, errors: string[]) => void) | (() => void)
	parentErrors?: string[]
	setLocalResize?: () => void
	txFees: bigint
	displayFirstWarningOnly?: boolean
}

export interface UnbondInputProps {
	active: BigNumber
	unbondToMin: BigNumber
	defaultValue: string
	disabled: boolean
	setters: ValueSetter[]
	value: string
}

export interface NominateStatusBarProps {
	value: BigNumber
}

export interface WarningProps {
	text: ReactNode
	status?: 'warning' | 'danger'
}

// PoolMembers types
export interface ClaimPermissionConfig {
	label: string
	value: ClaimPermission
	description: string
}
