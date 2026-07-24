// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import type { ReactNode } from 'react'
import type { BondFor, ClaimPermission, DisplayFor } from 'types'

export interface BondFeedbackProps {
	value: string
	onChange: (value: string) => void
	syncing?: boolean
	bondFor: BondFor
	bonding?: boolean
	listenIsValid?: (valid: boolean) => void
	parentErrors?: readonly string[]
	txFees: bigint
	maxWidth?: boolean
	displayFor?: DisplayFor
}

export interface UnbondFeedbackProps {
	value: string
	onChange: (value: string) => void
	bondFor: BondFor
	listenIsValid?: (valid: boolean) => void
	parentErrors?: readonly string[]
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
