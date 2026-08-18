// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface NominationHealthContextInterface {
	active: boolean
	enabled: boolean
	hasDangerWarnings: boolean
	setHasDangerWarnings: (hasDangerWarnings: boolean) => void
	stakingApiEnabled: boolean
	toggleEnabled: (enabled: boolean) => void
}

export interface NominationHealthSync {
	hasDangerWarnings?: boolean
}
