// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Validator } from 'types'

export interface NominationHealthContextInterface {
	active: boolean
	enabled: boolean
	hasDangerWarnings: boolean
	setHasDangerWarnings: (hasDangerWarnings: boolean) => void
	setValidatorsBelowThreshold: (validators: Validator[]) => void
	stakingApiEnabled: boolean
	toggleEnabled: (enabled: boolean) => void
	validatorsBelowThreshold: Validator[]
}

export interface NominationHealthSync {
	hasDangerWarnings?: boolean
	validatorsBelowThreshold?: Validator[]
}
