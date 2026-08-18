// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, SetStateAction } from 'react'
import type { Validator } from 'types'

export interface NominationHealthState {
	hasDangerWarnings: boolean
	isLoading: boolean
	validatorsBelowThreshold: Validator[]
}

export interface NominationHealthContextInterface
	extends NominationHealthState {
	active: boolean
	enabled: boolean
	setEnabled: Dispatch<SetStateAction<boolean>>
	setNominationHealth: Dispatch<SetStateAction<NominationHealthState>>
	stakingApiEnabled: boolean
}
