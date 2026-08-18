// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Validator } from 'types'

export interface NominationHealthContextInterface {
	active: boolean
	enabled: boolean
	fixing: boolean
	fixRequest: number
	hasDangerWarnings: boolean
	requestFix: () => void
	setHasDangerWarnings: (hasDangerWarnings: boolean) => void
	setFixing: (fixing: boolean) => void
	stakingApiEnabled: boolean
	toggleEnabled: (enabled: boolean) => void
}

export interface NominationHealthSync {
	hasDangerWarnings?: boolean
	isFixing?: boolean
	onFix?: (validators: Validator[]) => Promise<void>
	validatorsToFix?: Validator[]
}
