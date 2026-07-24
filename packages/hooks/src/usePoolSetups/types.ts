// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MaybeAddress, PoolRoles, ValidatorPrefs } from 'types'

export interface PoolSetupsHookInterface {
	getPoolSetup: (address: MaybeAddress) => PoolSetup
	setPoolSetup: (setup: PoolProgress) => void
	removePoolSetup: (address: MaybeAddress) => void
	getPoolSetupPercent: (a: MaybeAddress) => number
	setPoolSetupSection: (section: number) => void
}

export type PoolSetups = Record<string, PoolSetup>

export interface PoolSetup {
	section: number
	progress: PoolProgress
}

export interface PoolProgress {
	metadata: string
	bond: string
	nominations: { address: string; prefs: ValidatorPrefs }[]
	roles: PoolRoles | null
}
